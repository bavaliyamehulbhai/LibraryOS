const knowledgeService = require("../services/knowledgeService");

exports.getArticles = async (req, res) => {
  try {
    const articles = await knowledgeService.getAllArticles(req.user.libraryId, req.query.q);
    res.json({ success: true, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await knowledgeService.getArticleById(req.user.libraryId, req.params.id);
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });
    res.json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const article = await knowledgeService.createArticle(req.user.libraryId, req.body);
    res.json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFAQs = async (req, res) => {
  try {
    const faqs = await knowledgeService.getAllFAQs(req.user.libraryId, req.query.q);
    res.json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFAQ = async (req, res) => {
  try {
    const faq = await knowledgeService.createFAQ(req.user.libraryId, req.body);
    res.json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
