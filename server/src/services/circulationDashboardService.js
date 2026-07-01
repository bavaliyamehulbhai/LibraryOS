const mongoose = require("mongoose");
const Book = require("../models/Book");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");
const Fine = require("../models/Fine");
const Reservation = require("../models/Reservation");

exports.getOverviewStats = async (libraryId) => {
  const [
    totalBooks,
    totalMembers,
    activeIssues,
    overdueBooks,
    pendingFines,
    pendingReservations
  ] = await Promise.all([
    Book.countDocuments({ libraryId }),
    Member.countDocuments({ libraryId, status: "ACTIVE" }),
    Transaction.countDocuments({ libraryId, status: "ISSUED" }),
    Transaction.countDocuments({ libraryId, status: "ISSUED", dueDate: { $lt: new Date() } }),
    Fine.aggregate([
      { $match: { libraryId: new mongoose.Types.ObjectId(libraryId), status: "UNPAID" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Reservation.countDocuments({ libraryId, status: "PENDING" })
  ]);

  return {
    totalBooks,
    totalMembers,
    activeIssues,
    overdueBooks,
    pendingFines: pendingFines[0]?.total || 0,
    pendingReservations
  };
};

exports.getActivityFeed = async (libraryId) => {
  // To simulate a unified feed, we'll fetch recent transactions and fines and merge them.
  const [recentTransactions, recentFines] = await Promise.all([
    Transaction.find({ libraryId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("memberId", "firstName lastName")
      .populate("bookId", "title"),
    Fine.find({ libraryId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("memberId", "firstName lastName")
  ]);

  const feed = [
    ...recentTransactions.map(t => ({
      _id: t._id,
      type: "TRANSACTION",
      action: t.status,
      member: t.memberId ? `${t.memberId.firstName} ${t.memberId.lastName}` : "Unknown",
      details: t.bookId ? t.bookId.title : "Unknown Book",
      timestamp: t.createdAt
    })),
    ...recentFines.map(f => ({
      _id: f._id,
      type: "FINE",
      action: f.status === "PAID" ? "FINE_PAID" : "FINE_GENERATED",
      member: f.memberId ? `${f.memberId.firstName} ${f.memberId.lastName}` : "Unknown",
      details: `₹${f.amount}`,
      timestamp: f.createdAt
    }))
  ];

  feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return feed.slice(0, 15);
};
