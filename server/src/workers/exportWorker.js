const { Worker } = require("bullmq");
const fs = require("fs");
const path = require("path");
const exceljs = require("exceljs");
const PDFDocument = require("pdfkit");
const { createObjectCsvStringifier } = require("csv-writer");
const nodemailer = require("nodemailer");

const ExportJob = require("../models/ExportJob");
const Book = require("../models/Book");
const Inventory = require("../models/Inventory");
const Author = require("../models/Author");
const Publisher = require("../models/Publisher");
const Category = require("../models/Category");

const exportDir = path.join(__dirname, "../../exports");
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

// Redis config
const redisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null
};

// Dummy email transporter (will log to console since no SMTP provided)
const transporter = nodemailer.createTransport({
  streamTransport: true,
  newline: 'windows'
});

const generateCSV = async (data, fields, filePath) => {
  const csvStringifier = createObjectCsvStringifier({
    header: fields.map(f => ({ id: f.key, title: f.header }))
  });
  const header = csvStringifier.getHeaderString();
  const body = csvStringifier.stringifyRecords(data);
  fs.writeFileSync(filePath, header + body);
};

const generateExcel = async (data, fields, sheetName, filePath) => {
  const workbook = new exceljs.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  
  sheet.columns = fields.map(f => ({ header: f.header, key: f.key, width: 20 }));
  data.forEach(row => sheet.addRow(row));
  
  await workbook.xlsx.writeFile(filePath);
};

const generatePDF = async (data, fields, title, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text(title, { align: 'center' });
    doc.moveDown();

    // Simple tabular-like text layout for PDF
    data.forEach((row, idx) => {
      let rowText = `${idx + 1}. `;
      fields.forEach(f => {
        rowText += `${f.header}: ${row[f.key]} | `;
      });
      doc.fontSize(10).text(rowText);
      doc.moveDown(0.5);
    });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
};

const processExport = async (jobId, type, format, libraryId, filters) => {
  const filePath = path.join(exportDir, `${jobId}.${format}`);
  let data = [];
  let fields = [];
  let title = "Report";

  if (type === "books") {
    const query = { libraryId, ...filters };
    const books = await Book.find(query).populate("author publisher category");
    data = books.map(b => ({
      title: b.title,
      isbn: b.isbn,
      author: b.author?.name || "N/A",
      publisher: b.publisher?.name || "N/A",
      category: b.category?.name || "N/A"
    }));
    fields = [
      { header: "Title", key: "title" },
      { header: "ISBN", key: "isbn" },
      { header: "Author", key: "author" },
      { header: "Publisher", key: "publisher" },
      { header: "Category", key: "category" }
    ];
    title = "Books Export";
  } else if (type === "inventory") {
    const inv = await Inventory.find({ libraryId }).populate("bookId");
    data = inv.map(i => ({
      book: i.bookId?.title || "Unknown",
      total: i.totalCopies,
      available: i.availableCopies,
      issued: i.issuedCopies,
      reserved: i.reservedCopies
    }));
    fields = [
      { header: "Book Title", key: "book" },
      { header: "Total Copies", key: "total" },
      { header: "Available", key: "available" },
      { header: "Issued", key: "issued" },
      { header: "Reserved", key: "reserved" }
    ];
    title = "Inventory Report";
  } else {
    // Basic fallback for Authors/Publishers/Categories
    data = [{ info: "Not yet fully modeled in worker" }];
    fields = [{ header: "Info", key: "info" }];
  }

  if (format === "csv") await generateCSV(data, fields, filePath);
  else if (format === "xlsx") await generateExcel(data, fields, title, filePath);
  else if (format === "pdf") await generatePDF(data, fields, title, filePath);

  return filePath;
};

let worker;
try {
  if (process.env.USE_REDIS === 'true') {
    worker = new Worker("book-export-queue", async (job) => {
      const { jobId, type, format, libraryId, filters, emailTo } = job.data;
      
      await ExportJob.findByIdAndUpdate(jobId, { status: "PROCESSING" });

      const filePath = await processExport(jobId, type, format, libraryId, filters);

      await ExportJob.findByIdAndUpdate(jobId, { 
        status: "COMPLETED",
        filePath 
      });

      if (emailTo && emailTo.length > 0) {
        const info = await transporter.sendMail({
          from: '"LibraryOS" <no-reply@libraryos.com>',
          to: emailTo.join(", "),
          subject: "Your LibraryOS Scheduled Export",
          text: "Please find your requested export attached.",
          attachments: [
            {
              filename: `${type}_report.${format}`,
              path: filePath
            }
          ]
        });
        console.log(`[Export Worker] Email sent out. Mock ID: ${info.messageId}`);
      }

    }, { connection: redisOptions });

    worker.on("failed", async (job, err) => {
      console.error(`Export Job Failed: ${err}`);
      if (job?.data?.jobId) {
        await ExportJob.findByIdAndUpdate(job.data.jobId, { status: "FAILED" });
      }
    });

    console.log("BullMQ Worker for book-export-queue initialized.");
  } else {
    console.log("Redis is disabled. Skipping Export Worker.");
  }
} catch (error) {
  console.log("Could not initialize Export Worker (Redis missing?):", error.message);
}

module.exports = worker;
