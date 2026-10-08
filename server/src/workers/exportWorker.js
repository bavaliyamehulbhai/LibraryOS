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
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");
const Payment = require("../models/Payment");

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
  const normType = (type || "").toLowerCase();
  const normFormat = (format || "").toLowerCase() === "excel" ? "xlsx" : (format || "csv").toLowerCase();
  const filePath = path.join(exportDir, `${jobId}.${normFormat}`);
  let data = [];
  let fields = [];
  let title = "Export Report";

  if (normType === "books") {
    const query = { libraryId, ...filters };
    const books = await Book.find(query).populate("author publisher category");
    data = books.map(b => ({
      title: b.title || "N/A",
      isbn: b.isbn || "N/A",
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
    title = "Books Inventory Export";
  } else if (normType === "inventory") {
    const inv = await Inventory.find({ libraryId }).populate("bookId");
    data = inv.map(i => ({
      book: i.bookId?.title || "Unknown",
      total: i.totalCopies || 0,
      available: i.availableCopies || 0,
      issued: i.issuedCopies || 0,
      reserved: i.reservedCopies || 0
    }));
    fields = [
      { header: "Book Title", key: "book" },
      { header: "Total Copies", key: "total" },
      { header: "Available", key: "available" },
      { header: "Issued", key: "issued" },
      { header: "Reserved", key: "reserved" }
    ];
    title = "Inventory Report";
  } else if (normType === "students" || normType === "users" || normType === "members") {
    const members = await Member.find({ libraryId });
    data = members.map(m => ({
      code: m.memberCode || "N/A",
      name: `${m.firstName || ""} ${m.lastName || ""}`.trim() || "N/A",
      email: m.email || "N/A",
      phone: m.phone || "N/A",
      type: m.memberType || "N/A",
      status: m.status || "ACTIVE"
    }));
    fields = [
      { header: "Member Code", key: "code" },
      { header: "Full Name", key: "name" },
      { header: "Email", key: "email" },
      { header: "Phone", key: "phone" },
      { header: "Type", key: "type" },
      { header: "Status", key: "status" }
    ];
    title = "Members & Demographics Roster";
  } else if (normType === "transactions" || normType === "circulation") {
    const txns = await Transaction.find({ libraryId }).populate("bookId memberId");
    data = txns.map(t => ({
      code: t.transactionCode || t._id.toString().slice(-6),
      book: t.bookId?.title || "Unknown",
      member: t.memberId ? `${t.memberId.firstName || ""} ${t.memberId.lastName || ""}`.trim() : "Unknown",
      issueDate: t.issueDate ? new Date(t.issueDate).toLocaleDateString() : "N/A",
      dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "N/A",
      status: t.status || "N/A",
      fine: t.fineAmount || 0
    }));
    fields = [
      { header: "Transaction Code", key: "code" },
      { header: "Book Title", key: "book" },
      { header: "Member Name", key: "member" },
      { header: "Issue Date", key: "issueDate" },
      { header: "Due Date", key: "dueDate" },
      { header: "Status", key: "status" },
      { header: "Fine (₹)", key: "fine" }
    ];
    title = "Circulation & Transactions Ledger";
  } else if (normType === "financial") {
    const payments = await Payment.find({ libraryId }).populate("memberId");
    data = payments.map(p => ({
      code: p.paymentCode || p._id.toString().slice(-6),
      member: p.memberId ? `${p.memberId.firstName || ""} ${p.memberId.lastName || ""}`.trim() : "N/A",
      purpose: p.purpose || "N/A",
      amount: p.amount || 0,
      method: p.paymentMethod || "N/A",
      status: p.status || "SUCCESS",
      date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"
    }));
    fields = [
      { header: "Payment Code", key: "code" },
      { header: "Member", key: "member" },
      { header: "Purpose", key: "purpose" },
      { header: "Amount (₹)", key: "amount" },
      { header: "Payment Method", key: "method" },
      { header: "Status", key: "status" },
      { header: "Date", key: "date" }
    ];
    title = "Financial & Revenue Ledger";
  } else {
    data = [{ info: `Export for ${type} generated successfully` }];
    fields = [{ header: "Info", key: "info" }];
  }

  if (normFormat === "csv") await generateCSV(data, fields, filePath);
  else if (normFormat === "xlsx") await generateExcel(data, fields, title, filePath);
  else if (normFormat === "pdf") await generatePDF(data, fields, title, filePath);

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

module.exports = {
  worker,
  processExport
};
