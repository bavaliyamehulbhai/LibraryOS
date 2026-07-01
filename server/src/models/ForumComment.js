const mongoose = require("mongoose");

const forumCommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumPost",
      required: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: { type: String, required: true },
    isBestAnswer: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ForumComment", forumCommentSchema);
