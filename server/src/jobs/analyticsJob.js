const cron = require("node-cron");
const Library = require("../models/Library");
const analyticsService = require("../services/analyticsService");
const AnalyticsSnapshot = require("../models/AnalyticsSnapshot");

const generateDailySnapshots = async () => {
  try {
    const libraries = await Library.find({ isActive: true });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const lib of libraries) {
      // Check if snapshot already exists for today
      const existing = await AnalyticsSnapshot.findOne({
        libraryId: lib._id,
        date: { $gte: today }
      });

      if (!existing) {
        const dashboard = await analyticsService.getDashboardAnalytics(lib._id);
        
        await AnalyticsSnapshot.create({
          date: new Date(),
          totalBooks: dashboard.totalBooks,
          totalCopies: dashboard.totalCopies,
          issuedBooks: dashboard.issuedBooks,
          availableBooks: dashboard.availableBooks,
          activeUsers: dashboard.activeMembers,
          libraryId: lib._id
        });
        
        console.log(`[Analytics] Daily snapshot created for Library: ${lib.name}`);
      }
    }
  } catch (error) {
    console.error("Error generating daily analytics snapshots:", error);
  }
};

const startAnalyticsJob = () => {
  // Run daily at midnight
  cron.schedule("0 0 * * *", generateDailySnapshots);
  console.log("Cron Job: Daily Analytics Snapshot scheduled for 12:00 AM.");
};

module.exports = { startAnalyticsJob };
