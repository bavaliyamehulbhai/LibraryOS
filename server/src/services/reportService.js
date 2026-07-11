const Book = require("../models/Book");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");
const ResearchPaper = require("../models/ResearchPaper");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
  baseURL: "https://api.groq.com/openai/v1"
});

exports.getExecutiveDashboard = async (libraryId) => {
  let libId;
  try {
    const mongoose = require("mongoose");
    libId = new mongoose.Types.ObjectId(libraryId.toString());
  } catch (e) {
    libId = libraryId;
  }

  // Aggregate KPIs
  const totalBooks = await Book.countDocuments({ libraryId: libId });
  const totalMembers = await Member.countDocuments({ libraryId: libId, status: { $in: ["ACTIVE", "INACTIVE"] } });
  const totalTransactions = await Transaction.countDocuments({ libraryId: libId });
  const totalResearch = await ResearchPaper.countDocuments({ libraryId: libId });

  // Books by Category (Top 5)
  const categoryStats = await Book.aggregate([
    { $match: { libraryId: libId, category: { $nin: [null, ""] } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "categoryData" } },
    { $unwind: "$categoryData" },
    { $project: { _id: "$categoryData.name", count: 1 } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Books issued (Currently out vs Available vs Overdue)
  const outBooks = await Transaction.countDocuments({ libraryId: libId, status: "ISSUED" });
  const overdueBooks = await Transaction.countDocuments({ libraryId: libId, status: "OVERDUE" });

  return {
    kpis: {
      totalBooks,
      totalMembers,
      totalTransactions,
      totalResearch,
      activeIssues: outBooks,
      overdueIssues: overdueBooks
    },
    categoryStats
  };
};

exports.getAiInsights = async (libraryId) => {
  if (!process.env.GROQ_API_KEY) return "AI Insights unavailable without API key.";

  const data = await this.getExecutiveDashboard(libraryId);

  const prompt = `You are an AI Executive Librarian for LibraryOS. 
Analyze the following real-time data and provide a concise, 3-point bulleted executive summary of the library's performance, highlighting any risks (e.g. high overdue) or recommendations (e.g. growing categories).

Data:
Total Books: ${data.kpis.totalBooks}
Total Members: ${data.kpis.totalMembers}
Total Transactions: ${data.kpis.totalTransactions}
Currently Issued: ${data.kpis.activeIssues}
Overdue: ${data.kpis.overdueIssues}

Top Categories:
${data.categoryStats.map(c => `- ${c._id}: ${c.count} books`).join("\n")}
`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }]
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI Insights Error:", error.message);
    return "Failed to generate AI insights.";
  }
};
