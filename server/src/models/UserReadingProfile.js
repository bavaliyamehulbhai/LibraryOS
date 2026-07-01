const mongoose = require("mongoose");

const userReadingProfileSchema = new mongoose.Schema(
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
    categories: [{ type: String }],
    favoriteAuthors: [{ type: String }],
    totalBooksRead: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserReadingProfile", userReadingProfileSchema);
