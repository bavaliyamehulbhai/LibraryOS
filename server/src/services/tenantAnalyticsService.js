const Book = require("../models/Book");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction"); // Book issues/returns
const Fine = require("../models/Fine");

exports.getTenantOverview = async (libraryId) => {
  const totalBooks = await Book.countDocuments({ libraryId });
  const totalMembers = await Member.countDocuments({ libraryId });
  
  // Outstanding fines
  const unpaidFines = await Fine.find({ libraryId, status: "PENDING" });
  const pendingRevenue = unpaidFines.reduce((acc, f) => acc + (f.amount || 0), 0);

  // Completed Fines
  const paidFines = await Fine.find({ libraryId, status: "PAID" });
  const collectedRevenue = paidFines.reduce((acc, f) => acc + (f.amount || 0), 0);

  const activeTransactions = await Transaction.countDocuments({ libraryId, status: "ISSUED" });
  const overdueTransactions = await Transaction.countDocuments({ libraryId, status: "OVERDUE" });

  return {
    totalBooks,
    totalMembers,
    activeIssues: activeTransactions,
    overdueIssues: overdueTransactions,
    collectedRevenue,
    pendingRevenue
  };
};

exports.getGrowthAnalytics = async (libraryId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newMembers = await Member.countDocuments({ 
    libraryId, 
    createdAt: { $gte: thirtyDaysAgo } 
  });

  const recentTransactions = await Transaction.countDocuments({
    libraryId,
    issueDate: { $gte: thirtyDaysAgo }
  });

  // Sample historical data for charts
  const monthlyMemberGrowth = [
    { month: 'Jan', members: 120 },
    { month: 'Feb', members: 135 },
    { month: 'Mar', members: 160 },
    { month: 'Apr', members: 185 },
    { month: 'May', members: 210 },
    { month: 'Jun', members: 210 + newMembers }
  ];

  return {
    newMembersLast30Days: newMembers,
    recentIssues: recentTransactions,
    memberGrowthChart: monthlyMemberGrowth
  };
};

exports.getEngagementAnalytics = async (libraryId) => {
  // Aggregate top borrowed books for this library
  const topBooks = await Transaction.aggregate([
    { $match: { libraryId } },
    { $group: { _id: "$bookId", issueCount: { $sum: 1 } } },
    { $sort: { issueCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "books",
        localField: "_id",
        foreignField: "_id",
        as: "bookDetails"
      }
    },
    { $unwind: "$bookDetails" },
    {
      $project: {
        title: "$bookDetails.title",
        author: "$bookDetails.author",
        issueCount: 1
      }
    }
  ]);

  return { topBooks };
};
