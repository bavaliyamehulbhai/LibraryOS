const mongoose = require('mongoose');

const articleFeedbackSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KnowledgeArticle",
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // Optional, could be anonymous for public articles
  },
  helpful: {
    type: Boolean,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ArticleFeedback', articleFeedbackSchema);
