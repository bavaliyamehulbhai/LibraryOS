const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true
  },
  searchType: { type: String, enum: ["EXACT", "SEMANTIC"], default: "EXACT" },
  resultsCount: { type: Number, default: 0 },
  hasResults: { type: Boolean, default: true },
  semanticKeywords: [{ type: String }]
}, { timestamps: true });

searchHistorySchema.index({ libraryId: 1, query: 1 });
searchHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
