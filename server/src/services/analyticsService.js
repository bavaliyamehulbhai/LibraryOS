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
  const totalBooks = await Book.countDocuments({ libraryId, isActive: true });
  const users = await User.countDocuments({ libraryId, isActive: true });

  const inventoryStats = await Inventory.aggregate([
    { $match: { libraryId: new mongoose.Types.ObjectId(libraryId) } },
    { $group: { 
        _id: null, 
        totalCopies: { $sum: "$totalCopies" },
        issuedBooks: { $sum: "$issuedCopies" },
        availableBooks: { $sum: "$availableCopies" }
    }}
  ]);

  const inv = inventoryStats[0] || { totalCopies: 0, issuedBooks: 0, availableBooks: 0 };

  return {
    totalBooks,
    totalCopies: inv.totalCopies,
    issuedBooks: inv.issuedBooks,
    availableBooks: inv.availableBooks,
    activeMembers: users
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
