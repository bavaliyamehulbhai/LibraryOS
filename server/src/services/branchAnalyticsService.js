const mongoose = require("mongoose");
const Branch = require("../models/Branch");
const BookCopy = require("../models/BookCopy");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");

exports.getOverview = async (libraryId, branchId) => {
  const booksCount = await BookCopy.countDocuments({ libraryId, branchId });
  const membersCount = await Member.countDocuments({ libraryId, branchId });
  const issuesCount = await Transaction.countDocuments({ libraryId, branchId, type: "ISSUE" });
  const returnsCount = await Transaction.countDocuments({ libraryId, branchId, type: "RETURN" });

  // A simplistic revenue calculation based on membership fees and fines
  const revenue = membersCount * 500; 

  return {
    books: booksCount,
    members: membersCount,
    issues: issuesCount,
    returns: returnsCount,
    revenue: revenue
  };
};

exports.compareBranches = async (libraryId) => {
  const branches = await Branch.find({ libraryId, isActive: true }).select('name branchName branchCode');
  const comparison = [];

  for (const branch of branches) {
    const bId = branch._id;
    const books = await BookCopy.countDocuments({ libraryId, branchId: bId });
    const members = await Member.countDocuments({ libraryId, branchId: bId });
    const issues = await Transaction.countDocuments({ libraryId, branchId: bId, type: "ISSUE" });
    const revenue = members * 500;

    comparison.push({
      branchId: bId,
      branchName: branch.branchName || branch.name,
      branchCode: branch.branchCode,
      metrics: {
        books,
        members,
        issues,
        revenue
      }
    });
  }

  return comparison;
};

exports.calculateRanking = async (libraryId) => {
  const branchesData = await this.compareBranches(libraryId);
  
  // Calculate score: Revenue(40%) + Issues(30%) + Members(30%)
  // Normalized roughly
  const ranked = branchesData.map(b => {
    const score = (b.metrics.revenue * 0.4) + (b.metrics.issues * 5) + (b.metrics.members * 10);
    return {
      ...b,
      score: Math.round(score / 100)
    };
  }).sort((a, b) => b.score - a.score);

  return ranked;
};

exports.generateReport = async (libraryId, format) => {
  // Return some dummy url or buffer
  return {
    url: `/reports/download?type=branch-analytics&format=${format}`,
    status: "GENERATED"
  };
};

exports.getGrowthAnalytics = async (libraryId, branchId = null) => {
  // Dummy historical data for charts
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((m, i) => ({
    month: m,
    revenue: Math.floor(Math.random() * 50000) + 10000 * i,
    members: Math.floor(Math.random() * 500) + 100 * i,
    issues: Math.floor(Math.random() * 1000) + 200 * i
  }));
};
