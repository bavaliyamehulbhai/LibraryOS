const { Queue } = require("bullmq");
const ExportJob = require("../models/ExportJob");
const ScheduledExport = require("../models/ScheduledExport");
const AuditLog = require("../models/AuditLog");
const path = require("path");
const fs = require("fs");

const redisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null
};

let exportQueue;
try {
  if (process.env.USE_REDIS === 'true') {
    exportQueue = new Queue("book-export-queue", { connection: redisOptions });
  } else {
    console.log("Redis is disabled (USE_REDIS!=true). Skipping Export Queue.");
  }
} catch (error) {
  console.log("Could not initialize BullMQ Queue in export service.");
}

exports.requestExport = async (type, format, filters, libraryId, userId) => {
  if (!exportQueue) throw new Error("Export Queue is not available. Please ensure Redis is running.");

  const fileName = `${type}_export_${Date.now()}`;
  
  const job = await ExportJob.create({
    fileName,
    type,
    format,
    filters,
    libraryId,
    createdBy: userId
  });

  await AuditLog.create({
    action: "EXPORT_STARTED",
    entity: type.toUpperCase(),
    userId,
    libraryId,
    details: `Started manual ${format} export for ${type}`
  });

  await exportQueue.add("export-books", {
    jobId: job._id,
    type,
    format,
    libraryId,
    filters
  });

  return job;
};

exports.getExportProgress = async (jobId, libraryId) => {
  const job = await ExportJob.findOne({ _id: jobId, libraryId });
  if (!job) throw new Error("Export job not found");
  return job;
};

exports.getExportHistory = async (libraryId) => {
  return ExportJob.find({ libraryId })
    .populate("createdBy", "firstName lastName email")
    .sort({ createdAt: -1 });
};

exports.downloadExport = async (jobId, libraryId) => {
  const job = await ExportJob.findOne({ _id: jobId, libraryId });
  if (!job) throw new Error("Export job not found");
  if (job.status !== "COMPLETED") throw new Error("Export is not ready yet.");

  if (!job.filePath || !fs.existsSync(job.filePath)) {
    throw new Error("Export file no longer exists on server.");
  }

  await AuditLog.create({
    action: "EXPORT_DOWNLOADED",
    entity: "EXPORT_JOB",
    libraryId,
    details: `Downloaded export job ${jobId}`
  });

  return job;
};

exports.scheduleExport = async (data, libraryId, userId) => {
  const schedule = await ScheduledExport.create({
    ...data,
    libraryId,
    createdBy: userId
  });
  return schedule;
};

exports.getScheduledExports = async (libraryId) => {
  return ScheduledExport.find({ libraryId })
    .populate("createdBy", "firstName lastName email")
    .sort({ createdAt: -1 });
};

exports.getStats = async (libraryId) => {
  const totalExports = await ExportJob.countDocuments({ libraryId });
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);
  
  const exportsThisMonth = await ExportJob.countDocuments({ 
    libraryId, 
    createdAt: { $gte: startOfMonth } 
  });

  return {
    totalExports,
    exportsThisMonth
  };
};
