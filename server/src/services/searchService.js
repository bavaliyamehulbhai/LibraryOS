const Book = require("../models/Book");
const ResearchPaper = require("../models/ResearchPaper");
const SearchHistory = require("../models/SearchHistory");
const Author = require("../models/Author");
const Publisher = require("../models/Publisher");
const BookCopy = require("../models/BookCopy");
const Shelf = require("../models/Shelf");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
  baseURL: "https://api.groq.com/openai/v1"
});

exports.logSearch = async (query, libraryId, userId, searchType, resultsCount, semanticKeywords = []) => {
  try {
    await SearchHistory.create({
      query,
      libraryId,
      userId,
      searchType,
      resultsCount,
      hasResults: resultsCount > 0,
      semanticKeywords
    });
  } catch (err) {
    console.error("Search logging error:", err.message);
  }
};

exports.globalSearch = async (query, libraryId) => {
  // Execute parallel exact searches on Book and ResearchPaper
  const [books, research] = await Promise.all([
    Book.find({ libraryId, $text: { $search: query } })
      .populate('author', 'name')
      .sort({ score: { $meta: "textScore" } })
      .limit(10),
    ResearchPaper.find({ libraryId, $text: { $search: query }, status: "PUBLISHED" })
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
  ]);
  
  return { books, research };
};

exports.semanticSearch = async (query, libraryId) => {
  if (!process.env.GROQ_API_KEY) throw new Error("Semantic Search unavailable without API key");
  
  // 1. Ask Grok to extract core searchable keywords from natural language
  const prompt = `Convert this natural language query into 2-4 optimized database search keywords. Return ONLY the comma separated keywords, nothing else. Query: "${query}"`;
  
  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }]
  });
  
  const keywords = response.choices[0].message.content.split(',').map(k => k.trim());
  
  // 2. Perform the global search using the generated keywords
  const combinedQuery = keywords.join(" ");
  const [books, research] = await Promise.all([
    Book.find({ libraryId, $text: { $search: combinedQuery } })
      .populate('author', 'name')
      .sort({ score: { $meta: "textScore" } })
      .limit(10),
    ResearchPaper.find({ libraryId, $text: { $search: combinedQuery }, status: "PUBLISHED" })
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
  ]);
  
  return { books, research, keywords };
};

exports.getAnalytics = async (libraryId) => {
  const [topSearches, failedSearches, todayStats] = await Promise.all([
    SearchHistory.aggregate([
      { $match: { libraryId: libraryId, hasResults: true } },
      { $group: { _id: "$query", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    SearchHistory.aggregate([
      { $match: { libraryId: libraryId, hasResults: false } },
      { $group: { _id: "$query", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    SearchHistory.aggregate([
      { $match: { 
        libraryId: libraryId, 
        createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
      }},
      { $count: "total" }
    ])
  ]);
  
  return { 
    topSearches, 
    failedSearches, 
    totalToday: todayStats[0]?.total || 0 
  };
};

exports.quickSearch = async (query, libraryId) => {
  const regexQuery = new RegExp(query, "i");
  const Member = require("../models/Member");
  const Transaction = require("../models/Transaction");
  
  // For transactions, we might only match if the query is a valid ObjectId (since transaction IDs are mongo ObjectIds)
  // Or we can search by shortId if we had one. Let's just try to match ObjectId if possible.
  let transactionQuery = { libraryId, status: { $in: ["ISSUED", "OVERDUE", "RETURNED"] } };
  try {
    const mongoose = require("mongoose");
    if (mongoose.isValidObjectId(query)) {
      transactionQuery._id = new mongoose.Types.ObjectId(query);
    } else {
      transactionQuery = null; // Don't search transactions by random text to save db cycles
    }
  } catch(e) {}
  
  const [books, authors, publishers, copies, members, transactions] = await Promise.all([
    Book.find({ libraryId, $or: [{ title: regexQuery }, { isbn: regexQuery }, { author: regexQuery }] }).limit(10),
    Author.find({ libraryId, name: regexQuery }).limit(5),
    Publisher.find({ libraryId, name: regexQuery }).limit(5),
    BookCopy.find({ libraryId, copyCode: regexQuery }).populate("bookId", "title").limit(5),
    Member.find({ libraryId, $or: [{ firstName: regexQuery }, { lastName: regexQuery }, { email: regexQuery }] }).limit(5),
    transactionQuery ? Transaction.find(transactionQuery).populate("bookId", "title").populate("memberId", "firstName lastName").limit(5) : Promise.resolve([])
  ]);
  
  return { books, authors, publishers, copies, members, transactions };
};

exports.bookSearch = async (filters, libraryId) => {
  const query = { libraryId };
  if (filters.q) query.$or = [{ title: new RegExp(filters.q, "i") }, { isbn: new RegExp(filters.q, "i") }];
  if (filters.category) query.category = filters.category;
  if (filters.author) query.author = filters.author;
  if (filters.publisher) query.publisher = filters.publisher;
  
  return await Book.find(query).limit(50);
};

exports.authorSearch = async (query, libraryId) => {
  return await Author.find({ libraryId, name: new RegExp(query, "i") }).limit(20);
};

exports.publisherSearch = async (query, libraryId) => {
  return await Publisher.find({ libraryId, name: new RegExp(query, "i") }).limit(20);
};

exports.copySearch = async (query, libraryId) => {
  return await BookCopy.find({ libraryId, copyCode: new RegExp(query, "i") }).populate("bookId", "title isbn").limit(20);
};

exports.shelfSearch = async (query, libraryId) => {
  return await Shelf.find({ libraryId, name: new RegExp(query, "i") }).limit(20);
};

exports.getSuggestions = async (query, libraryId) => {
  // Fetch top 5 matching book titles for suggestions
  const books = await Book.find({ libraryId, title: new RegExp(query, "i") }).select("title").limit(5);
  return books.map(b => b.title);
};
