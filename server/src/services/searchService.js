const Book = require("../models/Book");
const ResearchPaper = require("../models/ResearchPaper");
const SearchHistory = require("../models/SearchHistory");
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
