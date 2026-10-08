const { registerCron } = require("../services/jobManager");
const Otp = require("../models/Otp");
const PasswordReset = require("../models/PasswordReset");

const processCleanup = async () => {
  try {
    const now = new Date();
    await Otp.deleteMany({ expiresAt: { $lt: now } });
    await PasswordReset.deleteMany({ expiresAt: { $lt: now } });
  } catch (err) {
    console.error("[CleanupJob] Error during system cleanup:", err.message);
  }
};

const startCleanupJob = () => {
  registerCron("0 3 * * *", "Daily System Cleanup", processCleanup);
};

module.exports = { startCleanupJob };
