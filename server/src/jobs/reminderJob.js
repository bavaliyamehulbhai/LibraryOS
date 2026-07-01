const { registerCron } = require("../services/jobManager");
const { processDueDateJobs } = require("../services/dueDateService");

const processReminders = async () => {
  console.log("[ReminderJob] Running due date reminder sweep...");
  await processDueDateJobs();
};

const startReminderJob = () => {
  registerCron("0 9 * * *", "Daily Reminders", processReminders);
};

module.exports = { startReminderJob };
