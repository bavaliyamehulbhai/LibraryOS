const JobExecution = require("../models/JobExecution");
const cron = require("node-cron");
const AuditLog = require("../models/AuditLog");

const runJob = async (jobName, jobFunction) => {
  const execution = await JobExecution.create({ jobName, status: "RUNNING" });
  await AuditLog.create({ action: "JOB_STARTED", entity: "SYSTEM", details: `Job Started: ${jobName}` });

  try {
    await jobFunction();
    execution.status = "SUCCESS";
    execution.completedAt = new Date();
    await execution.save();
    await AuditLog.create({ action: "JOB_COMPLETED", entity: "SYSTEM", details: `Job Completed: ${jobName}` });
  } catch (error) {
    execution.status = "FAILED";
    execution.error = error.message;
    execution.completedAt = new Date();
    await execution.save();
    await AuditLog.create({ action: "JOB_FAILED", entity: "SYSTEM", details: `Job Failed: ${jobName} - ${error.message}` });
  }
};

const registerCron = (schedule, jobName, jobFunction) => {
  cron.schedule(schedule, () => {
    runJob(jobName, jobFunction);
  });
};

module.exports = {
  runJob,
  registerCron
};
