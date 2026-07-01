const ExportJob = require("../models/ExportJob");
const AuditLog = require("../models/AuditLog");

const generateExport = async (libraryId, type, format) => {
  const job = await ExportJob.create({
    libraryId,
    type,
    format,
    status: "PROCESSING"
  });

  await AuditLog.create({
    action: "EXPORT_GENERATED",
    libraryId,
    description: `Started export of ${type} in ${format} format`
  });

  // Simulate export delay
  setTimeout(async () => {
    job.status = "COMPLETED";
    job.totalRecords = Math.floor(Math.random() * 500) + 50; // Mock count
    job.fileUrl = `/downloads/export_${job._id}.${format.toLowerCase()}`;
    await job.save();
  }, 2000);

  return job;
};

module.exports = {
  generateExport
};
