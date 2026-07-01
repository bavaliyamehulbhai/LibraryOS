const BorrowHistory = require("../models/BorrowHistory");
const Transaction = require("../models/Transaction");
const Fine = require("../models/Fine");
const { generateTransactionCode } = require("./transactionCodeService");

// ─────────────────────────────────────────────
// READING BADGES CONFIG
// ─────────────────────────────────────────────
const BADGES = [
  { min: 250, badge: "🏆 Library Champion", color: "#FFD700" },
  { min: 100, badge: "🥇 Gold Reader", color: "#FF8C00" },
  { min: 50,  badge: "🥈 Silver Reader", color: "#A8A9AD" },
  { min: 10,  badge: "🥉 Bronze Reader", color: "#CD7F32" },
  { min: 1,   badge: "📖 Beginner Reader", color: "#4CAF50" },
  { min: 0,   badge: "🆕 New Member", color: "#9E9E9E" },
];

const getBadge = (totalBorrowed) => {
  return BADGES.find(b => totalBorrowed >= b.min) || BADGES[BADGES.length - 1];
};

// ─────────────────────────────────────────────
// CREATE HISTORY ENTRY (Called by other services)
// ─────────────────────────────────────────────
exports.createHistory = async ({ libraryId, memberId, bookId, copyId, transactionId, action, remarks }) => {
  try {
    const historyCode = await generateTransactionCode(libraryId, "HIS");
    await BorrowHistory.create({
      historyCode,
      memberId,
      bookId,
      copyId,
      transactionId,
      action,
      actionDate: new Date(),
      remarks,
      libraryId
    });
  } catch (err) {
    console.error("[BorrowHistory] Failed to create history entry:", err.message);
  }
};

// ─────────────────────────────────────────────
// MEMBER TIMELINE
// ─────────────────────────────────────────────
exports.getMemberTimeline = async (libraryId, memberId) => {
  const events = await BorrowHistory.find({ libraryId, memberId })
    .populate("bookId", "title authors coverImage")
    .populate("copyId", "barcode")
    .sort({ actionDate: -1 });
  return events;
};

// ─────────────────────────────────────────────
// BOOK HISTORY (all members who borrowed)
// ─────────────────────────────────────────────
exports.getBookHistory = async (libraryId, bookId) => {
  const events = await BorrowHistory.find({ libraryId, bookId })
    .populate("memberId", "firstName lastName memberCode")
    .populate("copyId", "barcode")
    .sort({ actionDate: -1 });
  return events;
};

// ─────────────────────────────────────────────
// MEMBER READING STATS & BADGES
// ─────────────────────────────────────────────
exports.getMemberStats = async (libraryId, memberId) => {
  const [issued, returned, renewed, reserved] = await Promise.all([
    BorrowHistory.countDocuments({ libraryId, memberId, action: "ISSUED" }),
    BorrowHistory.countDocuments({ libraryId, memberId, action: "RETURNED" }),
    BorrowHistory.countDocuments({ libraryId, memberId, action: "RENEWED" }),
    BorrowHistory.countDocuments({ libraryId, memberId, action: "RESERVED" }),
  ]);

  // On-time returns: returned without any fine on that transaction
  const returnedTransactions = await BorrowHistory.find({ libraryId, memberId, action: "RETURNED" }).select("transactionId");
  const txIds = returnedTransactions.map(h => h.transactionId);
  const finesOnReturns = await Fine.countDocuments({ libraryId, memberId, transactionId: { $in: txIds }, fineType: "LATE_RETURN" });
  const onTimeReturns = returned - finesOnReturns;

  // Reading score: +3 per on-time return, +1 per return, -2 per overdue fine
  const overdues = await Fine.countDocuments({ libraryId, memberId, fineType: "LATE_RETURN" });
  const readingScore = Math.max(0, (onTimeReturns * 3) + (returned * 1) - (overdues * 2));

  const badge = getBadge(issued);

  return {
    totalIssued: issued,
    totalReturned: returned,
    totalRenewed: renewed,
    totalReserved: reserved,
    onTimeReturns,
    readingScore,
    badge: badge.badge,
    badgeColor: badge.color
  };
};

// ─────────────────────────────────────────────
// GLOBAL HISTORY DASHBOARD
// ─────────────────────────────────────────────
exports.getHistoryDashboard = async (libraryId) => {
  const [issued, returned, renewed, reserved] = await Promise.all([
    BorrowHistory.countDocuments({ libraryId, action: "ISSUED" }),
    BorrowHistory.countDocuments({ libraryId, action: "RETURNED" }),
    BorrowHistory.countDocuments({ libraryId, action: "RENEWED" }),
    BorrowHistory.countDocuments({ libraryId, action: "RESERVED" }),
  ]);

  // Recent activity
  const recent = await BorrowHistory.find({ libraryId })
    .populate("memberId", "firstName lastName memberCode")
    .populate("bookId", "title")
    .sort({ actionDate: -1 })
    .limit(20);

  // Most active months (group by month)
  const monthly = await BorrowHistory.aggregate([
    { $match: { libraryId, action: "ISSUED" } },
    { $group: { _id: { month: { $month: "$actionDate" }, year: { $year: "$actionDate" } }, count: { $sum: 1 } } },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 }
  ]);

  return { issued, returned, renewed, reserved, recent, monthly };
};
