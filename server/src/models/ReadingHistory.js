const mongoose = require("mongoose");

const readingHistorySchema = new mongoose.Schema(
  {
    libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "DigitalResource", required: true },
    lastPage: { type: Number, default: 1 },
    progress: { type: Number, default: 0 }, // 0 to 100 percentage
    isSaved: { type: Boolean, default: false }, // For "Save for Later"
    readingTime: { type: Number, default: 0 }, // in seconds
    bookmarks: [{ type: Number }], // Array of page numbers
    notes: [
      {
        page: Number,
        content: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReadingHistory", readingHistorySchema);
