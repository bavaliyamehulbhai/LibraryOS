const { registerCron } = require("../services/jobManager");

const processSubscriptions = async () => {
  // Check Trial Ending (Notify 7 days, 3 days, 1 day before)
  // Check Subscriptions Expiring
  // Automatically suspend Library if Subscription Expired past grace period
  // console.log("[Job] Processed Subscriptions successfully.");
};

const startSubscriptionJob = () => {
  registerCron("0 1 * * *", "Daily Subscription Checks", processSubscriptions);
};

module.exports = { startSubscriptionJob };
