const mongoose = require("mongoose");

const readingProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    favoriteCategories: [{ type: String }],
    favoriteAuthors: [{ type: String }],
    totalBooksRead: { type: Number, default: 0 },
    totalHoursRead: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastReadDate: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReadingProfile", readingProfileSchema);
