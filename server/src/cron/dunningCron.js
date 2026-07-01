const cron = require("node-cron");
const Invoice = require("../models/Invoice");

// Run every night at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running Dunning Engine Cron Job...");
    const now = new Date();

    // 1. Mark Overdue Invoices
    const pendingInvoices = await Invoice.find({
      status: "PENDING",
      dueDate: { $lt: now }
    });

    for (let inv of pendingInvoices) {
      inv.status = "OVERDUE";
      await inv.save();
      console.log(`Invoice ${inv.invoiceNumber} marked as OVERDUE.`);
      // Future: Send Overdue Email
    }

    // 2. Reminder Engine (7 days, 3 days, 1 day)
    const upcomingInvoices = await Invoice.find({ status: "PENDING" });
    for (let inv of upcomingInvoices) {
      const diffTime = inv.dueDate - now;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysLeft === 7 || daysLeft === 3 || daysLeft === 1) {
        console.log(`Sending Dunning Reminder: Invoice ${inv.invoiceNumber} is due in ${daysLeft} days.`);
        // Future: Send Reminder Email via nodemailer
      }
    }
  } catch (err) {
    console.error("Dunning Engine Error:", err);
  }
});
