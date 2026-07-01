const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },
    recommendedBooks: [
      {
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        title: { type: String },
        reason: { type: String }
      }
    ],
    source: {
      type: String,
      enum: ["AI", "SYSTEM"],
      default: "SYSTEM"
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
