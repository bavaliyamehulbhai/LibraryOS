const analyticsService = require("../services/analyticsService");

exports.getDashboard = async (req, res) => {
  try {
    const data = await analyticsService.getDashboardAnalytics(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const data = await analyticsService.getBookAnalytics(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const data = await analyticsService.getCategoryAnalytics(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const data = await analyticsService.getInventoryAnalytics(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTrends = async (req, res) => {
  try {
    const data = await analyticsService.getTrendAnalytics(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getExecutiveReport = async (req, res) => {
  try {
    const data = await analyticsService.getExecutiveReport(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
