const { Worker } = require("bullmq");
const fs = require("fs");
const csvParser = require("csv-parser");
const xlsx = require("xlsx");
const Book = require("../models/Book");
const Author = require("../models/Author");
const Publisher = require("../models/Publisher");
const Category = require("../models/Category");
const Inventory = require("../models/Inventory");
const BookCopy = require("../models/BookCopy");
const ImportJob = require("../models/ImportJob");
const ImportError = require("../models/ImportError");
const AuditLog = require("../models/AuditLog");

// Redis configuration
const redisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null
};

// Process row
const processRow = async (row, libraryId, rowIndex, jobId) => {
  try {
    const title = (row.Title || row.title || "").trim();
    let isbn = (row.ISBN || row.isbn || "").toString().trim();
    const authorName = (row.Author || row.author || "").trim();
    const publisherName = (row.Publisher || row.publisher || "").trim();
    const categoryName = (row.Category || row.category || "").trim();
    const language = (row.Language || row.language || "English").trim();

    if (!title) throw new Error("Missing Title");
    if (!isbn) throw new Error("Missing ISBN");

    // Check duplicate
    const existingBook = await Book.findOne({ isbn, libraryId });
    if (existingBook) throw new Error(`Duplicate ISBN: ${isbn} already exists`);

    // Auto Create Related Records
    let authorId, publisherId, categoryId;

    if (authorName) {
      let author = await Author.findOne({ name: new RegExp(`^${authorName}$`, "i"), libraryId });
      if (!author) author = await Author.create({ name: authorName, libraryId });
      authorId = author._id;
    }

    if (publisherName) {
      let publisher = await Publisher.findOne({ name: new RegExp(`^${publisherName}$`, "i"), libraryId });
      if (!publisher) publisher = await Publisher.create({ name: publisherName, libraryId });
      publisherId = publisher._id;
    }

    if (categoryName) {
      let category = await Category.findOne({ name: new RegExp(`^${categoryName}$`, "i"), libraryId });
      if (!category) category = await Category.create({ name: categoryName, libraryId });
      categoryId = category._id;
    }

    // Create Book
    const book = await Book.create({
      title,
      isbn,
      author: authorId,
      publisher: publisherId,
      category: categoryId,
      language,
      libraryId
    });

    // Create Inventory
    await Inventory.create({
      bookId: book._id,
      libraryId,
      totalCopies: 1,
      availableCopies: 1
    });

    // Generate unique copy code
    const copyCount = await BookCopy.countDocuments({ libraryId });
    const copyCode = `BOOK-${String(copyCount + 1).padStart(6, '0')}`;

    // Create Copy
    await BookCopy.create({
      bookId: book._id,
      copyCode,
      libraryId,
      status: "AVAILABLE",
      condition: "NEW"
    });

    return { success: true };
  } catch (err) {
    await ImportError.create({
      rowNumber: rowIndex,
      error: err.message,
      data: row,
      importJobId: jobId
    });
    return { success: false };
  }
};

// Start worker
let worker;
try {
  if (process.env.USE_REDIS === 'true') {
    worker = new Worker("book-import-queue", async (job) => {
    const { jobId, filePath, libraryId } = job.data;
    
    await ImportJob.findByIdAndUpdate(jobId, { status: "PROCESSING" });

    let rows = [];
    const ext = filePath.split('.').pop().toLowerCase();

    // Parse Excel/CSV
    if (ext === "csv") {
      rows = await new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on("data", (data) => results.push(data))
          .on("end", () => resolve(results))
          .on("error", reject);
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }

    await ImportJob.findByIdAndUpdate(jobId, { totalRows: rows.length });

    let successRows = 0;
    let failedRows = 0;

    for (let i = 0; i < rows.length; i++) {
      const result = await processRow(rows[i], libraryId, i + 2, jobId); // +2 for header offset
      if (result.success) successRows++;
      else failedRows++;

      // Update progress every 10 rows
      if (i % 10 === 0 || i === rows.length - 1) {
        await job.updateProgress(Math.floor((i / rows.length) * 100));
        await ImportJob.findByIdAndUpdate(jobId, {
          processedRows: i + 1,
          successRows,
          failedRows
        });
      }
    }

    await ImportJob.findByIdAndUpdate(jobId, { status: "COMPLETED" });
    
    await AuditLog.create({
      action: "IMPORT_COMPLETED",
      entity: "BOOK",
      libraryId,
      details: `Import job ${jobId} finished. Success: ${successRows}, Failed: ${failedRows}`
    });

  }, { connection: redisOptions });

  worker.on("failed", async (job, err) => {
    console.error(`Import Job Failed: ${err}`);
    if (job?.data?.jobId) {
      await ImportJob.findByIdAndUpdate(job.data.jobId, { status: "FAILED" });
    }
  });

  console.log("BullMQ Worker for book-import-queue initialized successfully.");
  } else {
    console.log("Redis is disabled. Skipping Import Worker.");
  }
} catch (error) {
  console.log("Could not initialize BullMQ Worker (Redis might be missing):", error.message);
}

module.exports = worker;
