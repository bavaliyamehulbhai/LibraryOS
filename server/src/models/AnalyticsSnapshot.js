const mongoose = require("mongoose");

const analyticsSnapshotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  totalBooks: { type: Number, default: 0 },
  totalCopies: { type: Number, default: 0 },
  issuedBooks: { type: Number, default: 0 },
  availableBooks: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true
  }
}, { timestamps: true });

analyticsSnapshotSchema.index({ libraryId: 1, date: -1 });

module.exports = mongoose.model("AnalyticsSnapshot", analyticsSnapshotSchema);
