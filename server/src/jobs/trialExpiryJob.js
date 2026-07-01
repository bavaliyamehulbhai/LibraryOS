const cron = require("node-cron");
const Library = require("../models/Library");
const AuditLog = require("../models/AuditLog");

// Run everyday at midnight (00:00)
const checkTrialExpiry = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("[Job] Running Trial Expiry Check...");
    try {
      const now = new Date();
      const expiredLibraries = await Library.find({
        status: "TRIAL",
        trialEndsAt: { $lt: now }
      });

      for (const library of expiredLibraries) {
        library.status = "EXPIRED";
        await library.save();

        await AuditLog.create({
          action: "TRIAL_EXPIRED",
          module: "SUBSCRIPTION",
          libraryId: library._id,
          description: `Trial period expired for library ${library.name}`
        });
        
        console.log(`[Job] Expired trial for library: ${library.name}`);
      }
    } catch (error) {
      console.error("[Job] Error in Trial Expiry Check:", error);
    }
  });
};

module.exports = { checkTrialExpiry };
