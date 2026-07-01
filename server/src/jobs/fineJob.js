const { registerCron } = require("../services/jobManager");
const { processDueDateJobs } = require("../services/dueDateService");

const processFines = async () => {
  console.log("[FineJob] Running nightly fine & overdue sweep...");
  // dueDateService.processDueDateJobs handles BOTH overdue marking AND fine generation.
  // This job runs at midnight to cover any books that crossed the due date overnight.
  await processDueDateJobs();
};

const startFineJob = () => {
  registerCron("0 0 * * *", "Daily Fine Calculator", processFines);
};

module.exports = { startFineJob };
