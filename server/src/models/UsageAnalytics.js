const mongoose = require("mongoose");

const usageAnalyticsSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
  usersCount: { type: Number, default: 0 },
  booksCount: { type: Number, default: 0 },
  branchesCount: { type: Number, default: 0 },
  storageUsed: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("UsageAnalytics", usageAnalyticsSchema);
