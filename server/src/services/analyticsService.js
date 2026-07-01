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

  return {
    totalBooks,
    totalCopies: inv.totalCopies,
    issuedBooks: totalIssued,
    availableBooks: inv.availableBooks,
    totalMembers,
    activeMembers,
    totalReturned,
    overdueCount,
    pendingFines
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

exports.getTrendAnalytics = async (libraryId) => {
  const snapshots = await AnalyticsSnapshot.find({ libraryId })
    .sort({ date: 1 })
    .limit(30);
    
  return snapshots.map(s => ({
    date: s.date.toISOString().split("T")[0],
    totalBooks: s.totalBooks,
    issuedBooks: s.issuedBooks,
    activeUsers: s.activeUsers
  }));
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
