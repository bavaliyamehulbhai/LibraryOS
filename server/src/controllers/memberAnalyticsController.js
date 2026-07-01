const analyticsService = require("../services/memberAnalyticsService");

exports.getDashboard = async (req, res) => {
  try {
    const data = await analyticsService.getDashboardMetrics(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const data = await analyticsService.getMemberStats(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getReading = async (req, res) => {
  try {
    const data = await analyticsService.getReadingStats(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getRisk = async (req, res) => {
  try {
    const data = await analyticsService.getRiskAnalysis(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
