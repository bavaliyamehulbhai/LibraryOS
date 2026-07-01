const cron = require("node-cron");
const { processQueue } = require("../services/emailQueueService");

// Process the email queue every minute
const startEmailWorker = () => {
  cron.schedule("* * * * *", async () => {
    // console.log("[Worker] Running Email Queue Processor...");
    try {
      await processQueue();
    } catch (error) {
      console.error("[Worker] Error processing email queue:", error);
    }
  });
};

module.exports = { startEmailWorker };
