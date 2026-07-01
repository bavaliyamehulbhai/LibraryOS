const mongoose = require("mongoose");

const forumPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true
    },
    views: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["ACTIVE", "LOCKED", "ARCHIVED", "DELETED"],
      default: "ACTIVE"
    },
    commentsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ForumPost", forumPostSchema);
