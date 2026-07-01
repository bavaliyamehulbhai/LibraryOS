const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: String,
  icon: String,
  description: String,
  earnedAt: { type: Date, default: Date.now }
});

const gamificationProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    badges: [badgeSchema],
    booksRead: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("GamificationProfile", gamificationProfileSchema);
