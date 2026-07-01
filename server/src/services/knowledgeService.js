const KnowledgeArticle = require("../models/KnowledgeArticle");
const FAQ = require("../models/FAQ");

exports.getAllArticles = async (libraryId, query) => {
  const filter = { libraryId, status: "PUBLISHED" };
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } }
    ];
  }
  return await KnowledgeArticle.find(filter).sort({ views: -1 });
};

exports.getArticleById = async (libraryId, articleId) => {
  const article = await KnowledgeArticle.findOne({ _id: articleId, libraryId });
  if (article) {
    article.views += 1;
    await article.save();
  }
  return article;
};

exports.createArticle = async (libraryId, data) => {
  return await KnowledgeArticle.create({ ...data, libraryId });
};

exports.getAllFAQs = async (libraryId, query) => {
  const filter = { libraryId };
  if (query) {
    filter.$or = [
      { question: { $regex: query, $options: "i" } },
      { answer: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } }
    ];
  }
  return await FAQ.find(filter).sort({ order: 1 });
};

exports.createFAQ = async (libraryId, data) => {
  return await FAQ.create({ ...data, libraryId });
};
