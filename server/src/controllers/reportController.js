const reportService = require("../services/reportService");

exports.getExecutiveDashboard = async (req, res) => {
  try {
    const dashboardData = await reportService.getExecutiveDashboard(req.user.libraryId);
    res.json({ success: true, data: dashboardData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAiInsights = async (req, res) => {
  try {
    const insights = await reportService.getAiInsights(req.user.libraryId);
    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
