const Transaction = require("../models/Transaction");
const Member = require("../models/Member");
const Book = require("../models/Book");
const BookCopy = require("../models/BookCopy");
const Fine = require("../models/Fine");

exports.routeIntent = async (intent, libraryId, user) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  switch (intent) {
    case "GET_OVERDUE_BOOKS": {
      const overdueCount = await Transaction.countDocuments({ 
        libraryId, 
        status: { $in: ["OVERDUE", "ISSUED", "RENEWED"] },
        dueDate: { $lt: now }
      });
      return { 
        intent: "GET_OVERDUE_BOOKS",
        count: overdueCount, 
        summary: "Total number of overdue books requiring immediate attention." 
      };
    }

    case "GET_MEMBERS_SUMMARY": {
      const totalMembers = await Member.countDocuments({ libraryId });
      const activeMembers = await Member.countDocuments({ libraryId, status: "ACTIVE" });
      const joinedThisMonth = await Member.countDocuments({ 
        libraryId, 
        createdAt: { $gte: startOfMonth } 
      });
      return { 
        intent: "GET_MEMBERS_SUMMARY",
        total: totalMembers, 
        active: activeMembers, 
        joinedThisMonth 
      };
    }

    case "GET_BOOKS_SUMMARY": {
      const totalTitles = await Book.countDocuments({ libraryId, isActive: true });
      const totalCopies = await BookCopy.countDocuments({ libraryId });
      const availableCopies = await BookCopy.countDocuments({ libraryId, status: "AVAILABLE" });
      return { 
        intent: "GET_BOOKS_SUMMARY",
        totalTitles: totalTitles || totalCopies,
        totalCopies, 
        availableCopies 
      };
    }

    case "GET_FINES_SUMMARY": {
      const pendingFines = await Fine.find({ libraryId, status: { $in: ["PENDING", "UNPAID"] } });
      const totalAmount = pendingFines.reduce((sum, f) => sum + (f.amount || 0), 0);
      return {
        intent: "GET_FINES_SUMMARY",
        pendingFinesCount: pendingFines.length,
        totalUnpaidAmount: totalAmount
      };
    }

    case "GET_ANALYTICS": {
      const monthlyCirculation = await Transaction.countDocuments({ 
        libraryId, 
        issueDate: { $gte: startOfMonth } 
      });
      const totalMembers = await Member.countDocuments({ libraryId });
      return { 
        intent: "GET_ANALYTICS",
        monthlyCirculation,
        totalMembers,
        growth: "Positive", 
        message: "Monthly performance indicators compiled from active operations."
      };
    }

    default:
      return { 
        intent: "GENERAL_QUERY",
        message: "General inquiry." 
      };
  }
};
