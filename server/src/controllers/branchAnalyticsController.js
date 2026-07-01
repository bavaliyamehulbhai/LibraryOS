const branchAnalyticsService = require("../services/branchAnalyticsService");

exports.getOverview = async (req, res) => {
  try {
    const data = await branchAnalyticsService.getOverview(req.user.libraryId, req.query.branchId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getComparison = async (req, res) => {
  try {
    const data = await branchAnalyticsService.compareBranches(req.user.libraryId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRanking = async (req, res) => {
  try {
    const data = await branchAnalyticsService.calculateRanking(req.user.libraryId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGrowth = async (req, res) => {
  try {
    const data = await branchAnalyticsService.getGrowthAnalytics(req.user.libraryId, req.query.branchId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const format = req.query.format || "pdf";
    const data = await branchAnalyticsService.generateReport(req.user.libraryId, format);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
