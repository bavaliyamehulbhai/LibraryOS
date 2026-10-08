const { registerCron } = require("../services/jobManager");
const Invoice = require("../models/Invoice");

const processSubscriptions = async () => {
  try {
    const now = new Date();
    // Mark Overdue Invoices
    const pendingInvoices = await Invoice.find({
      status: "PENDING",
      dueDate: { $lt: now }
    });

    for (let inv of pendingInvoices) {
      inv.status = "OVERDUE";
      await inv.save();
    }
  } catch (err) {
    console.error("[SubscriptionJob] Error processing subscription/invoice dunning:", err.message);
  }
};

const startSubscriptionJob = () => {
  registerCron("0 1 * * *", "Daily Subscription & Invoice Checks", processSubscriptions);
};

module.exports = { startSubscriptionJob };
