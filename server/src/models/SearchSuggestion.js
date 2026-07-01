const mongoose = require("mongoose");

const searchSuggestionSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true,
    trim: true
  },
  count: {
    type: Number,
    default: 1
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true
  }
}, { timestamps: true });

searchSuggestionSchema.index({ libraryId: 1, term: 1 }, { unique: true });
searchSuggestionSchema.index({ count: -1 });

module.exports = mongoose.model("SearchSuggestion", searchSuggestionSchema);
