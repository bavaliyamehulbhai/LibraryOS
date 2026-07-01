const { Queue } = require("bullmq");
const ImportJob = require("../models/ImportJob");
const ImportError = require("../models/ImportError");
const AuditLog = require("../models/AuditLog");
const { createObjectCsvStringifier } = require("csv-writer");

// Redis configuration
const redisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null
};

let importQueue;
try {
  if (process.env.USE_REDIS === 'true') {
    importQueue = new Queue("book-import-queue", { connection: redisOptions });
  } else {
    console.log("Redis is disabled (USE_REDIS!=true). Skipping Import Queue.");
  }
} catch (error) {
  console.log("Could not initialize BullMQ Queue:", error.message);
}

const queueImport = async (file, libraryId, userId) => {
  if (!importQueue) throw new Error("Import Queue is not available. Please ensure Redis is running.");

  const job = await ImportJob.create({
    fileName: file.originalname,
    status: "PENDING",
    libraryId,
    createdBy: userId
  });

  await AuditLog.create({
    action: "IMPORT_STARTED",
    entity: "BOOK",
    userId,
    libraryId,
    details: `Started bulk import for file: ${file.originalname}`
  });

  await importQueue.add("import-books", {
    jobId: job._id,
    filePath: file.path,
    libraryId
  });

  return job;
};

const getJobProgress = async (jobId, libraryId) => {
  const job = await ImportJob.findOne({ _id: jobId, libraryId });
  if (!job) throw new Error("Import job not found");
  return job;
};

const getImportHistory = async (libraryId) => {
  return ImportJob.find({ libraryId })
    .populate("createdBy", "firstName lastName email")
    .sort({ createdAt: -1 });
};

const getErrorCSV = async (jobId, libraryId) => {
  const job = await ImportJob.findOne({ _id: jobId, libraryId });
  if (!job) throw new Error("Import job not found");

  const errors = await ImportError.find({ importJobId: jobId }).sort({ rowNumber: 1 });

  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: "rowNumber", title: "Row" },
      { id: "error", title: "Error Message" },
      { id: "data", title: "Raw Data Provided" }
    ]
  });

  const records = errors.map(err => ({
    rowNumber: err.rowNumber,
    error: err.error,
    data: JSON.stringify(err.data)
  }));

  const header = csvStringifier.getHeaderString();
  const body = csvStringifier.stringifyRecords(records);

  return header + body;
};

const generateTemplate = () => {
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: "title", title: "Title" },
      { id: "isbn", title: "ISBN" },
      { id: "author", title: "Author" },
      { id: "publisher", title: "Publisher" },
      { id: "category", title: "Category" },
      { id: "language", title: "Language" }
    ]
  });

  return csvStringifier.getHeaderString();
};

const getStats = async (libraryId) => {
  const totalImports = await ImportJob.countDocuments({ libraryId });
  
  const jobs = await ImportJob.find({ libraryId, status: "COMPLETED" });
  const totalBooksImported = jobs.reduce((acc, job) => acc + job.successRows, 0);

  return {
    totalImports,
    totalBooksImported
  };
};

module.exports = {
  queueImport,
  getJobProgress,
  getImportHistory,
  getErrorCSV,
  generateTemplate,
  getStats
};
