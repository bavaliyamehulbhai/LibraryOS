const mongoose = require("mongoose");
const Book = require("../models/Book");
const Inventory = require("../models/Inventory");
const User = require("../models/User");
const AnalyticsSnapshot = require("../models/AnalyticsSnapshot");
const Category = require("../models/Category");
const Author = require("../models/Author");
const Publisher = require("../models/Publisher");
const BookCopy = require("../models/BookCopy");

exports.getDashboardAnalytics = async (libraryId) => {
  const Member = require("../models/Member");
  const Transaction = require("../models/Transaction");
  const Fine = require("../models/Fine");

  const libId = new mongoose.Types.ObjectId(libraryId);

  const [totalBooks, totalMembers, activeMembers] = await Promise.all([
    Book.countDocuments({ libraryId, isActive: true }),
    Member.countDocuments({ libraryId }),
    Member.countDocuments({ libraryId, status: "ACTIVE" })
  ]);

  const inventoryStats = await Inventory.aggregate([
    { $match: { libraryId: libId } },
    { $group: { 
        _id: null, 
        totalCopies: { $sum: "$totalCopies" },
        issuedBooks: { $sum: "$issuedCopies" },
        availableBooks: { $sum: "$availableCopies" }
    }}
  ]);

  const inv = inventoryStats[0] || { totalCopies: 0, issuedBooks: 0, availableBooks: 0 };

  // Get real transaction counts
  const [totalIssued, totalReturned, overdueCount] = await Promise.all([
    Transaction.countDocuments({ libraryId, status: { $in: ["ISSUED", "RENEWED"] } }),
    Transaction.countDocuments({ libraryId, status: "RETURNED" }),
    Transaction.countDocuments({ libraryId, status: "OVERDUE" })
  ]);

  // Get pending fines total
  const fineAgg = await Fine.aggregate([
    { $match: { libraryId: libId, status: { $in: ["PENDING", "PARTIAL"] } } },
    { $group: { _id: null, total: { $sum: "$pendingAmount" } } }
  ]);
  const pendingFines = fineAgg[0]?.total || 0;

  // Get total revenue (Payments)
  const Payment = require("../models/Payment");
  const revenueAgg = await Payment.aggregate([
    { $match: { libraryId: libId, status: "SUCCESS" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  return {
    totalBooks,
    totalCopies: inv.totalCopies,
    issuedBooks: totalIssued,
    availableBooks: inv.availableBooks,
    totalMembers,
    activeMembers,
    totalReturned,
    overdueCount,
    pendingFines,
    totalRevenue
  };
};


exports.getBookAnalytics = async (libraryId) => {
  const mostPopular = await Inventory.aggregate([
    { $match: { libraryId: new mongoose.Types.ObjectId(libraryId) } },
    { $sort: { issuedCopies: -1 } },
    { $limit: 5 },
    { $lookup: { from: "books", localField: "bookId", foreignField: "_id", as: "book" } },
    { $unwind: "$book" },
    { $project: { title: "$book.title", issues: "$issuedCopies" } }
  ]);

  const deadInventory = await Inventory.aggregate([
    { $match: { libraryId: new mongoose.Types.ObjectId(libraryId), issuedCopies: 0 } },
    { $lookup: { from: "books", localField: "bookId", foreignField: "_id", as: "book" } },
    { $unwind: "$book" },
    { $project: { title: "$book.title", available: "$availableCopies" } },
    { $limit: 5 }
  ]);

  return { mostPopular, deadInventory };
};

exports.getCategoryAnalytics = async (libraryId) => {
  const stats = await Book.aggregate([
    { $match: { libraryId: new mongoose.Types.ObjectId(libraryId), isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "categoryDetails" } },
    { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
    { $project: { name: { $ifNull: ["$categoryDetails.name", "Uncategorized"] }, count: 1, _id: 0 } },
    { $sort: { count: -1 } }
  ]);
  return stats;
};

exports.getInventoryAnalytics = async (libraryId) => {
  const lowStock = await Inventory.aggregate([
    { $match: { libraryId: new mongoose.Types.ObjectId(libraryId), availableCopies: { $lt: 3, $gt: 0 } } },
    { $lookup: { from: "books", localField: "bookId", foreignField: "_id", as: "book" } },
    { $unwind: "$book" },
    { $project: { book: "$book.title", available: "$availableCopies" } },
    { $sort: { available: 1 } },
    { $limit: 10 }
  ]);

  const copyStats = await BookCopy.aggregate([
    { $match: { libraryId: new mongoose.Types.ObjectId(libraryId) } },
    { $group: { _id: "$condition", count: { $sum: 1 } } }
  ]);

  return { lowStock, copyStats };
};

exports.getReadingAnalytics = async (libraryId) => {
  const Transaction = require("../models/Transaction");
  let libId;
  try {
    libId = new mongoose.Types.ObjectId(libraryId.toString());
  } catch (e) {
    libId = libraryId;
  }
  
  const [totalIssues, totalReturns] = await Promise.all([
    Transaction.countDocuments({ libraryId: libId, status: { $in: ["ISSUED", "RENEWED", "RETURNED", "OVERDUE", "LOST"] } }),
    Transaction.countDocuments({ libraryId: libId, status: "RETURNED" })
  ]);
  
  const completionRate = totalIssues > 0 ? Math.round((totalReturns / totalIssues) * 100) : 0;
  
  const topReaders = await Transaction.aggregate([
    { $match: { libraryId: libId } },
    { $group: { _id: "$memberId", borrowCount: { $sum: 1 } } },
    { $sort: { borrowCount: -1 } },
    { $limit: 10 },
    { $addFields: { 
        memberObjectId: { 
          $convert: { input: "$_id", to: "objectId", onError: null, onNull: null } 
        } 
    }},
    { $lookup: { from: "members", localField: "memberObjectId", foreignField: "_id", as: "member" } },
    { $unwind: { path: "$member", preserveNullAndEmptyArrays: true } },
    { $project: {
        _id: 1,
        name: { 
          $cond: { 
            if: { $and: ["$member.firstName", "$member.lastName"] }, 
            then: { $concat: ["$member.firstName", " ", "$member.lastName"] },
            else: { $ifNull: ["$member.firstName", "Unknown Reader"] }
          }
        },
        memberCode: { $ifNull: ["$member.memberCode", "N/A"] },
        borrowCount: 1
    }}
  ]);
  
  return { totalIssues, totalReturns, completionRate, topReaders };
};

exports.getRiskAnalytics = async (libraryId) => {
  const Fine = require("../models/Fine");
  let libId;
  try {
    libId = new mongoose.Types.ObjectId(libraryId.toString());
  } catch (e) {
    libId = libraryId;
  }
  
  const totalOutstandingAgg = await Fine.aggregate([
    { $match: { libraryId: libId, status: "UNPAID" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const totalOutstandingAmount = totalOutstandingAgg.length > 0 ? totalOutstandingAgg[0].total : 0;
  
  const fineRisks = await Fine.aggregate([
    { $match: { libraryId: libId, status: "UNPAID" } },
    { $group: { _id: "$memberId", totalUnpaid: { $sum: "$amount" }, fineCount: { $sum: 1 } } },
    { $sort: { totalUnpaid: -1 } },
    { $limit: 10 },
    { $addFields: { 
        memberObjectId: { 
          $convert: { input: "$_id", to: "objectId", onError: null, onNull: null } 
        } 
    }},
    { $lookup: { from: "members", localField: "memberObjectId", foreignField: "_id", as: "member" } },
    { $unwind: { path: "$member", preserveNullAndEmptyArrays: true } },
    { $project: {
        _id: 1,
        name: { 
          $cond: { 
            if: { $and: ["$member.firstName", "$member.lastName"] }, 
            then: { $concat: ["$member.firstName", " ", "$member.lastName"] },
            else: { $ifNull: ["$member.firstName", "Unknown Reader"] }
          }
        },
        email: { $ifNull: ["$member.email", "No Email"] },
        fineCount: 1,
        totalUnpaid: 1
    }}
  ]);
  
  return { totalOutstandingAmount, fineRisks };
};

exports.getTrendAnalytics = async (libraryId, days = 30) => {
  const Member = require("../models/Member");
  const Transaction = require("../models/Transaction");
  const Payment = require("../models/Payment");
  const libId = new mongoose.Types.ObjectId(libraryId.toString());

  const result = [];
  
  for (let i = 5; i >= 0; i--) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - i);
    startDate.setDate(1);
    startDate.setHours(0,0,0,0);
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    
    const monthName = startDate.toLocaleString('default', { month: 'short' });
    
    const [revenueAgg, activeUsers, transactions] = await Promise.all([
      Payment.aggregate([
        { $match: { libraryId: libId, status: "SUCCESS", createdAt: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Member.countDocuments({ libraryId: libId, createdAt: { $lt: endDate } }),
      Transaction.countDocuments({ libraryId: libId, createdAt: { $gte: startDate, $lt: endDate } })
    ]);
    
    result.push({
      name: monthName,
      revenue: revenueAgg.length > 0 ? revenueAgg[0].total : 0,
      activeUsers: activeUsers,
      libraries: transactions // Tracking transactions volume instead of libraries
    });
  }

  return result;
};

exports.getHealthAnalytics = async (libraryId) => {
  const Member = require("../models/Member");
  const Transaction = require("../models/Transaction");
  const libId = new mongoose.Types.ObjectId(libraryId.toString());

  const [totalMembers, activeMembers, blockedMembers, totalTransactions, overdueTransactions] = await Promise.all([
    Member.countDocuments({ libraryId: libId }),
    Member.countDocuments({ libraryId: libId, status: "ACTIVE" }),
    Member.countDocuments({ libraryId: libId, status: "BLOCKED" }),
    Transaction.countDocuments({ libraryId: libId }),
    Transaction.countDocuments({ libraryId: libId, status: "OVERDUE" })
  ]);

  const activeRatio = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;
  let healthScore = 100;
  
  if (activeRatio < 50) healthScore -= 20;
  else if (activeRatio < 70) healthScore -= 10;
  
  if (totalMembers > 0 && (blockedMembers / totalMembers) * 100 > 5) healthScore -= 15;
  if (totalTransactions > 0 && (overdueTransactions / totalTransactions) * 100 > 10) healthScore -= 15;

  return {
    score: Math.max(0, healthScore),
    status: healthScore >= 80 ? "Healthy" : healthScore >= 60 ? "Warning" : "Critical",
    metrics: { activeRatio: Math.round(activeRatio), blockedMembers, overdueTransactions }
  };
};

exports.getChurnAnalytics = async (libraryId) => {
  const Member = require("../models/Member");
  const libId = new mongoose.Types.ObjectId(libraryId.toString());
  const sixtyDaysAgo = new Date(Date.now() - 60*24*60*60*1000);
  
  const [totalMembers, inactiveMembers] = await Promise.all([
    Member.countDocuments({ libraryId: libId }),
    Member.countDocuments({ libraryId: libId, updatedAt: { $lt: sixtyDaysAgo }, status: { $ne: "BLOCKED" } })
  ]);
  
  const churnRisk = totalMembers > 0 ? Math.round((inactiveMembers / totalMembers) * 100) : 0;

  return {
    churnRisk,
    inactiveMembers,
    totalMembers,
    riskLevel: churnRisk > 20 ? "High" : churnRisk > 10 ? "Medium" : "Low"
  };
};

exports.getInsights = async (libraryId) => {
  const Transaction = require("../models/Transaction");
  const libId = new mongoose.Types.ObjectId(libraryId.toString());
  const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000);
  
  const recentBorrowings = await Transaction.countDocuments({ libraryId: libId, createdAt: { $gte: thirtyDaysAgo } });

  const insights = [];
  if (recentBorrowings > 0) {
    insights.push({
      type: "positive",
      title: "Active Borrowing",
      description: `Library has recorded ${recentBorrowings} transactions in the last 30 days.`
    });
  } else {
    insights.push({
      type: "warning",
      title: "Low Engagement",
      description: "No borrowing activity detected in the last 30 days. Consider promoting popular books."
    });
  }
  return insights;
};

exports.getExecutiveReport = async (libraryId) => {
  const dashboard = await this.getDashboardAnalytics(libraryId);
  const books = await this.getBookAnalytics(libraryId);
  const categories = await this.getCategoryAnalytics(libraryId);

  return {
    ...dashboard,
    topBook: books.mostPopular[0]?.title || "N/A",
    topCategory: categories[0]?.name || "N/A"
  };
};
