const ReadingSession = require("../models/ReadingSession");
const ReadingProfile = require("../models/ReadingProfile");
const Book = require("../models/Book");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
  baseURL: "https://api.groq.com/openai/v1"
});

exports.simulateReadingData = async (libraryId, userId) => {
  // Grab some books
  const books = await Book.find({ libraryId }).limit(5);
  if (books.length === 0) throw new Error("No books found to simulate reading");

  const sessions = [];
  let totalMins = 0;

  for (let i = 0; i < 15; i++) {
    const book = books[Math.floor(Math.random() * books.length)];
    const mins = Math.floor(Math.random() * 60) + 10;
    totalMins += mins;
    
    // Random date within last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    sessions.push({
      userId,
      bookId: book._id,
      libraryId,
      startTime: date,
      endTime: new Date(date.getTime() + mins * 60000),
      totalMinutes: mins,
      pagesRead: Math.floor(mins * 1.5), // Approx 1.5 pages per min
      completionPercentage: Math.min(100, Math.floor(Math.random() * 100))
    });
  }

  await ReadingSession.insertMany(sessions);

  // Update Profile
  let profile = await ReadingProfile.findOne({ userId });
  if (!profile) {
    profile = new ReadingProfile({ userId, libraryId });
  }
  
  profile.totalHoursRead += (totalMins / 60);
  profile.totalBooksRead += 2; // Simulate some completed
  profile.currentStreak = Math.floor(Math.random() * 10) + 1;
  profile.lastReadDate = new Date();
  
  await profile.save();
  return { message: "Simulated reading data injected!" };
};

exports.getGlobalOverview = async (libraryId) => {
  // Aggregate total reading hours
  const result = await ReadingSession.aggregate([
    { $match: { libraryId: libraryId } },
    { $group: { _id: null, totalMinutes: { $sum: "$totalMinutes" }, activeReaders: { $addToSet: "$userId" } } }
  ]);

  const totalMinutes = result[0]?.totalMinutes || 0;
  const activeReaders = result[0]?.activeReaders.length || 0;
  const totalHours = Math.floor(totalMinutes / 60);

  return { totalHours, activeReaders };
};

exports.getTopBooks = async (libraryId) => {
  return await ReadingSession.aggregate([
    { $match: { libraryId: libraryId } },
    { $group: { _id: "$bookId", totalReads: { $sum: 1 }, totalMinutes: { $sum: "$totalMinutes" } } },
    { $sort: { totalReads: -1 } },
    { $limit: 5 },
    { $lookup: { from: "books", localField: "_id", foreignField: "_id", as: "book" } },
    { $unwind: "$book" },
    { $project: { title: "$book.title", coverImage: "$book.coverImage", totalReads: 1, totalMinutes: 1 } }
  ]);
};

exports.getReaderLeaderboard = async (libraryId) => {
  return await ReadingProfile.find({ libraryId })
    .populate("userId", "firstName lastName email")
    .sort({ totalHoursRead: -1 })
    .limit(10);
};

exports.generateAIInsights = async (libraryId) => {
  if (!process.env.GROQ_API_KEY) return "AI Insights unavailable. Please configure GROQ_API_KEY.";
  
  const overview = await this.getGlobalOverview(libraryId);
  const topBooks = await this.getTopBooks(libraryId);
  
  const prompt = `You are a data analyst for a library. 
Based on these stats:
Total Reading Hours: ${overview.totalHours}
Active Readers: ${overview.activeReaders}
Top Books: ${topBooks.map(b => b.title).join(", ")}

Write a short, encouraging 2-sentence summary of the reading culture and behavior trends for the library admin dashboard.`;

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
