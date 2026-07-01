const mongoose = require("mongoose");

const readingSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalMinutes: { type: Number, required: true },
    pagesRead: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReadingSession", readingSessionSchema);
