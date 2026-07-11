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
    pendingReservations,
    totalRevenue
  ] = await Promise.all([
    Book.countDocuments({ libraryId }),
    Member.countDocuments({ libraryId, status: "ACTIVE" }),
    Transaction.countDocuments({ libraryId, status: "ISSUED" }),
    Transaction.countDocuments({ libraryId, status: "ISSUED", dueDate: { $lt: new Date() } }),
    Fine.aggregate([
      { $match: { libraryId: new mongoose.Types.ObjectId(libraryId), status: "UNPAID" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Reservation.countDocuments({ libraryId, status: "PENDING" }),
    mongoose.model("Payment").aggregate([
      { $match: { libraryId: new mongoose.Types.ObjectId(libraryId), status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
  ]);

  return {
    totalBooks,
    totalMembers,
    activeIssues,
    overdueBooks,
    pendingFines: pendingFines[0]?.total || 0,
    pendingReservations,
    totalRevenue: totalRevenue[0]?.total || 0
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

exports.getChartData = async (libraryId, daysParam = 7) => {
  // Generate the last N days array based on local server time
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  for (let i = daysParam - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({
      date: d,
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      issues: 0,
      returns: 0,
      fines: 0
    });
  }

  const startDate = days[0].date;
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999); // End of today

  const [transactions, fines] = await Promise.all([
    Transaction.find({ 
      libraryId, 
      $or: [
        { issueDate: { $gte: startDate, $lte: endDate } },
        { returnDate: { $gte: startDate, $lte: endDate } }
      ]
    }),
    Fine.find({
      libraryId,
      createdAt: { $gte: startDate, $lte: endDate }
    })
  ]);

  // Bucket data
  days.forEach(day => {
    const nextDay = new Date(day.date);
    nextDay.setDate(nextDay.getDate() + 1);

    transactions.forEach(t => {
      if (t.issueDate >= day.date && t.issueDate < nextDay) {
        day.issues++;
      }
      if (t.returnDate && t.returnDate >= day.date && t.returnDate < nextDay) {
        day.returns++;
      }
    });

    fines.forEach(f => {
      if (f.createdAt >= day.date && f.createdAt < nextDay) {
        day.fines += f.amount;
      }
    });
  });

  return days.map(d => ({
    name: d.name,
    issues: d.issues,
    returns: d.returns,
    fines: d.fines
  }));
};
