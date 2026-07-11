const cron = require("node-cron");
const Transaction = require("../models/Transaction");
const Member = require("../models/Member");
const Library = require("../models/Library");

// Format date helper to ignore time component for pure day calculation
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Automation Engine Job - Runs every night at 12:01 AM
const startAutomationEngine = () => {
  cron.schedule("1 0 * * *", async () => {
    console.log("[AUTOMATION ENGINE] Starting daily cron job...");
    
    try {
      const today = startOfDay(new Date());
      const allLibraries = await Library.find({ status: "ACTIVE" });

      for (const library of allLibraries) {
        const settings = library.automationSettings || {
          dailyFineAmount: 5,
          maxFineLimit: 100,
          enableEmailReminders: true,
          enableAutoBlock: true
        };

        // Find all active issues for this library
        const activeIssues = await Transaction.find({ 
          libraryId: library._id, 
          status: { $in: ["ISSUED", "OVERDUE", "RENEWED"] }
        }).populate("memberId");

        for (const issue of activeIssues) {
          const dueDate = startOfDay(issue.dueDate);
          const member = issue.memberId;
          
          if (!member) continue;

          // 1. FINE CALCULATION & OVERDUE MARKING
          if (dueDate < today) {
            if (issue.status !== "OVERDUE") {
              issue.status = "OVERDUE";
            }
            
            const diffTime = today - dueDate;
            const lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            issue.lateDays = lateDays;
            
            // Calculate fine for this specific book
            issue.fineAmount = lateDays * settings.dailyFineAmount;

            // Send Overdue Email
            if (settings.enableEmailReminders && !issue.overdueAlertSent) {
              console.log(`[EMAIL] ⚠️ Overdue alert sent to ${member.email} for book copy ${issue.bookCopyId}`);
              issue.overdueAlertSent = true;
            }
          }

          // 2. PRE-DUE REMINDERS (3 days before)
          const diffDaysToDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
          
          if (diffDaysToDue === 3 && settings.enableEmailReminders && !issue.reminderSent3DaysBefore) {
            console.log(`[EMAIL] 📅 Reminder sent to ${member.email} (Due in 3 days)`);
            issue.reminderSent3DaysBefore = true;
          }

          // 3. DUE TODAY ALERTS
          if (diffDaysToDue === 0 && settings.enableEmailReminders && !issue.dueTodaySent) {
            console.log(`[EMAIL] 🚨 Due Today alert sent to ${member.email}`);
            issue.dueTodaySent = true;
          }

          await issue.save();

          // 4. AUTO-BLOCKING
          if (settings.enableAutoBlock && issue.fineAmount >= settings.maxFineLimit) {
            if (member.status !== "BLOCKED") {
              console.log(`[BLOCK] Member ${member.email} blocked due to exceeding max fine limit (Fine: ₹${issue.fineAmount})`);
              member.status = "BLOCKED";
              member.blockReason = `Exceeded maximum fine limit (₹${settings.maxFineLimit})`;
              await member.save();
            }
          }
        }
      }
      
      console.log("[AUTOMATION ENGINE] Daily job completed successfully.");
    } catch (error) {
      console.error("[AUTOMATION ENGINE] Error running daily cron job:", error);
    }
  });
};

module.exports = { startAutomationEngine };
