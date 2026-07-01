const cron = require("node-cron");
const ScheduledExport = require("../models/ScheduledExport");
const ExportJob = require("../models/ExportJob");
const { Queue } = require("bullmq");

const redisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null
};

let exportQueue;
try {
  if (process.env.USE_REDIS === 'true') {
    exportQueue = new Queue("book-export-queue", { connection: redisOptions });
  }
} catch (error) {
  console.log("Could not initialize BullMQ Queue in scheduled job.");
}

const checkScheduledExports = async () => {
  try {
    const activeSchedules = await ScheduledExport.find({ isActive: true });
    
    const now = new Date();
    
    for (const schedule of activeSchedules) {
      let isDue = false;
      
      if (!schedule.lastRunAt) {
        isDue = true;
      } else {
        const hoursSinceLastRun = (now - schedule.lastRunAt) / (1000 * 60 * 60);
        
        if (schedule.frequency === "DAILY" && hoursSinceLastRun >= 24) isDue = true;
        if (schedule.frequency === "WEEKLY" && hoursSinceLastRun >= 168) isDue = true;
        if (schedule.frequency === "MONTHLY" && hoursSinceLastRun >= 720) isDue = true;
      }

      if (isDue) {
        // Create Export Job
        const fileName = `Scheduled_${schedule.type}_${Date.now()}`;
        const job = await ExportJob.create({
          fileName,
          format: schedule.format,
          type: schedule.type,
          filters: schedule.filters,
          createdBy: schedule.createdBy,
          libraryId: schedule.libraryId
        });

        if (exportQueue) {
          await exportQueue.add("export-books", {
            jobId: job._id,
            type: schedule.type,
            format: schedule.format,
            libraryId: schedule.libraryId,
            filters: schedule.filters,
            emailTo: schedule.recipients
          });
        }

        // Update last run
        schedule.lastRunAt = now;
        await schedule.save();
      }
    }
  } catch (error) {
    console.error("Scheduled Export Job Error:", error);
  }
};

const startScheduledExportJob = () => {
  // Run every hour
  cron.schedule("0 * * * *", checkScheduledExports);
  console.log("Cron Job: Scheduled Exports running every hour.");
};

module.exports = { startScheduledExportJob };
