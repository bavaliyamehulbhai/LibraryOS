const mongoose = require("mongoose");

const knowledgeArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT"
    },
    views: { type: Number, default: 0 },
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("KnowledgeArticle", knowledgeArticleSchema);
