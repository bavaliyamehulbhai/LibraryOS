const mongoose = require("mongoose");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");
const Fine = require("../models/Fine");

exports.getMemberStats = async (libraryId) => {
  const [totalMembers, activeMembers, blockedMembers] = await Promise.all([
    Member.countDocuments({ libraryId }),
    Member.countDocuments({ libraryId, status: "ACTIVE" }),
    Member.countDocuments({ libraryId, status: "BLOCKED" })
  ]);

  // Aggregate by membershipType
  const typeBreakdown = await Member.aggregate([
    { $match: { libraryId: new mongoose.Types.ObjectId(libraryId) } },
    { $group: { _id: "$membershipType", count: { $sum: 1 } } }
  ]);

  return {
    total: totalMembers,
    active: activeMembers,
    blocked: blockedMembers,
    inactive: totalMembers - activeMembers - blockedMembers,
    typeBreakdown: typeBreakdown.map(t => ({ name: t._id || "STANDARD", value: t.count }))
  };
};

exports.getReadingStats = async (libraryId) => {
  // Top Readers (by count of Transactions)
  const topReaders = await Transaction.aggregate([
    { $match: { libraryId: new mongoose.Types.ObjectId(libraryId) } },
    { $group: { _id: "$memberId", borrowCount: { $sum: 1 } } },
    { $sort: { borrowCount: -1 } },
    { $limit: 10 },
    { $lookup: { from: "members", localField: "_id", foreignField: "_id", as: "member" } },
    { $unwind: "$member" },
    { $project: {
      _id: 1,
      name: { $concat: ["$member.firstName", " ", "$member.lastName"] },
      memberCode: "$member.memberCode",
      borrowCount: 1
    }}
  ]);

  // Category Popularity (Assuming Book model is populated in transactions, but we can't easily join Book unless we do another lookup)
  // To keep it simple, we will aggregate fine and transaction basic stats
  const totalIssues = await Transaction.countDocuments({ libraryId, transactionType: "ISSUE" });
  const totalReturns = await Transaction.countDocuments({ libraryId, transactionType: "RETURN" });
  
  const completionRate = totalIssues > 0 ? Math.round((totalReturns / totalIssues) * 100) : 0;

  return {
    topReaders,
    totalIssues,
    totalReturns,
    completionRate
  };
};

exports.getRiskAnalysis = async (libraryId) => {
  // Find members with most outstanding fines
  const fineRisks = await Fine.aggregate([
    { $match: { libraryId: new mongoose.Types.ObjectId(libraryId), status: "UNPAID" } },
    { $group: { _id: "$memberId", totalUnpaid: { $sum: "$amount" }, fineCount: { $sum: 1 } } },
    { $match: { totalUnpaid: { $gt: 0 } } },
    { $sort: { totalUnpaid: -1 } },
    { $limit: 10 },
    { $lookup: { from: "members", localField: "_id", foreignField: "_id", as: "member" } },
    { $unwind: "$member" },
    { $project: {
      _id: 1,
      name: { $concat: ["$member.firstName", " ", "$member.lastName"] },
      email: "$member.email",
      totalUnpaid: 1,
      fineCount: 1
    }}
  ]);

  const totalOutstandingFines = await Fine.aggregate([
    { $match: { libraryId: new mongoose.Types.ObjectId(libraryId), status: "UNPAID" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  return {
    fineRisks,
    totalOutstandingAmount: totalOutstandingFines[0]?.total || 0
  };
};

exports.getDashboardMetrics = async (libraryId) => {
  const [members, reading, risk] = await Promise.all([
    this.getMemberStats(libraryId),
    this.getReadingStats(libraryId),
    this.getRiskAnalysis(libraryId)
  ]);

  return { members, reading, risk };
};
