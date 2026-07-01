const analyticsService = require("../services/analyticsService");
const AuditLog = require("../models/AuditLog");
const ActivityLog = require("../models/ActivityLog");
const SecurityLog = require("../models/SecurityLog");
const Book = require("../models/Book");
const Inventory = require("../models/Inventory");

exports.getDashboardMaster = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;

    // 1. KPI Stats
    const stats = await analyticsService.getDashboardAnalytics(libraryId);

    // 2. Charts (Issues Trend & Categories)
    const trends = await analyticsService.getTrendAnalytics(libraryId);
    const categories = await analyticsService.getCategoryAnalytics(libraryId);

    // 3. Alerts (Low Stock, Security, Pending Imports)
    const lowStock = await Inventory.aggregate([
      { $match: { libraryId: libraryId, availableCopies: { $lt: 3, $gt: 0 } } },
      { $lookup: { from: "books", localField: "bookId", foreignField: "_id", as: "book" } },
      { $unwind: "$book" },
      { $project: { title: "$book.title", available: "$availableCopies", _id: "$book._id" } },
      { $limit: 5 }
    ]);

    const securityAlerts = await SecurityLog.find({ 
      libraryId, 
      severity: { $in: ["HIGH", "CRITICAL"] } 
    }).sort({ createdAt: -1 }).limit(3);

    // 4. Activity Feed
    const activityFeed = await ActivityLog.find({ libraryId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats,
        charts: { trends, categories },
        alerts: { lowStock, securityAlerts },
        activityFeed
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
