const { registerCron } = require("../services/jobManager");

const processCleanup = async () => {
  // Delete Expired OTPs from DB
  // Delete Old Sessions
  // Delete Temporary Files
  // console.log("[Job] Processed Cleanup successfully.");
};

const startCleanupJob = () => {
  registerCron("0 3 * * *", "Daily System Cleanup", processCleanup);
};

module.exports = { startCleanupJob };
