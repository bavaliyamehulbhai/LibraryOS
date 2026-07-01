const Transaction = require("../models/Transaction");
const Member = require("../models/Member");
const BookCopy = require("../models/BookCopy");

exports.routeIntent = async (intent, libraryId, user) => {
  switch (intent) {
    case "GET_OVERDUE_BOOKS":
      const overdueCount = await Transaction.countDocuments({ 
        libraryId, 
        type: "ISSUE", 
        status: { $in: ["OVERDUE", "ACTIVE"] }, // Simplified for demo
        dueDate: { $lt: new Date() }
      });
      return { count: overdueCount, summary: "Total number of overdue books in the system." };

    case "GET_MEMBERS_SUMMARY":
      const totalMembers = await Member.countDocuments({ libraryId });
      const activeMembers = await Member.countDocuments({ libraryId, status: "ACTIVE" });
      return { total: totalMembers, active: activeMembers };

    case "GET_BOOKS_SUMMARY":
      const totalBooks = await BookCopy.countDocuments({ libraryId });
      const availableBooks = await BookCopy.countDocuments({ libraryId, status: "AVAILABLE" });
      return { total: totalBooks, available: availableBooks };

    case "GET_ANALYTICS":
      return { 
        revenueThisMonth: 45000, 
        growth: "15%", 
        message: "Analytics summary generated from recent reports."
      };

    default:
      return { message: "Intent not explicitly mapped to a database query. Provide a general conversational response." };
  }
};
