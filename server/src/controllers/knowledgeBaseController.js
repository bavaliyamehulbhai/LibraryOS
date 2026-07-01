const kbService = require("../services/knowledgeBaseService");

exports.getCategories = async (req, res) => {
  try {
    const libraryId = req.user?.libraryId || null;
    const categories = await kbService.getCategories(libraryId);
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getArticles = async (req, res) => {
  try {
    const libraryId = req.user?.libraryId || null;
    const { q, category } = req.query;
    const articles = await kbService.getArticles(libraryId, q, category);
    res.status(200).json({ success: true, data: articles });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getArticleBySlug = async (req, res) => {
  try {
    const libraryId = req.user?.libraryId || null;
    const article = await kbService.getArticleBySlug(req.params.slug, libraryId);
    const stats = await kbService.getArticleStats(article._id);
    
    res.status(200).json({ success: true, data: { ...article.toObject(), stats } });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const userId = req.user?._id || null;
    const { helpful } = req.body;
    
    const feedback = await kbService.submitFeedback(req.params.id, userId, helpful);
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin Routes
exports.createCategory = async (req, res) => {
  try {
    const category = await kbService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const libraryId = req.user.role === "SUPER_ADMIN" ? null : req.user.libraryId;
    const data = {
      ...req.body,
      authorId: req.user._id,
      tenantId: libraryId
    };
    
    const article = await kbService.createArticle(data);
    res.status(201).json({ success: true, data: article });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
