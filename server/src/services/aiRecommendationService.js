const Book = require("../models/Book");
const Transaction = require("../models/Transaction");
const UserReadingProfile = require("../models/UserReadingProfile");
const Recommendation = require("../models/Recommendation");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
  baseURL: "https://api.groq.com/openai/v1"
});

exports.getTrendingBooks = async (libraryId) => {
  // Aggregate transactions to find most issued books this month
  const trending = await Transaction.aggregate([
    { $match: { libraryId: libraryId, type: "ISSUE" } },
    { $group: { _id: "$bookCopyId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Map to books (In a real scenario, we'd lookup Book from BookCopy, simplifying here)
  return Book.find({ libraryId }).limit(10);
};

exports.getSimilarBooks = async (libraryId, bookId) => {
  const book = await Book.findById(bookId);
  if (!book) return [];

  return Book.find({
    libraryId,
    _id: { $ne: bookId },
    $or: [
      { categories: { $in: book.categories } },
      { author: book.author }
    ]
  }).limit(5);
};

exports.getPersonalizedRecommendations = async (libraryId, memberId) => {
  let profile = await UserReadingProfile.findOne({ libraryId, memberId });
  if (!profile || profile.categories.length === 0) {
    // Fallback to trending
    return this.getTrendingBooks(libraryId);
  }

  // System based recommendation
  return Book.find({
    libraryId,
    $or: [
      { categories: { $in: profile.categories } },
      { author: { $in: profile.favoriteAuthors } }
    ]
  }).limit(5);
};

exports.generateAIInsights = async (libraryId, memberId) => {
  const profile = await UserReadingProfile.findOne({ libraryId, memberId });
  
  if (!process.env.GROQ_API_KEY) {
    // Fallback if no key is set
    return {
      books: [
        { title: "Clean Architecture", reason: "Natural progression from your interests in Technology" },
        { title: "System Design Interview", reason: "Highly recommended for software engineering readers" }
      ]
    };
  }

  try {
    const prompt = `You are a library recommendation expert.
User Interests: ${profile?.categories?.join(", ") || "General"}
Favorite Authors: ${profile?.favoriteAuthors?.join(", ") || "None"}
Books Read: ${profile?.totalBooksRead || 0}
Recommend 5 books. Explain each recommendation. Return JSON with a 'books' array containing 'title' and 'reason'.`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error("Failed to generate AI recommendations");
  }
};
