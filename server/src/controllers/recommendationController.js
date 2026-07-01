const aiRecommendationService = require("../services/aiRecommendationService");

exports.getPersonalized = async (req, res) => {
  try {
    const data = await aiRecommendationService.getPersonalizedRecommendations(req.user.libraryId, req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const data = await aiRecommendationService.getTrendingBooks(req.user.libraryId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSimilar = async (req, res) => {
  try {
    const data = await aiRecommendationService.getSimilarBooks(req.user.libraryId, req.params.bookId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateAI = async (req, res) => {
  try {
    const data = await aiRecommendationService.generateAIInsights(req.user.libraryId, req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
