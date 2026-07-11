const dashboardService = require("../services/circulationDashboardService");

exports.getDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getOverviewStats(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const data = await dashboardService.getActivityFeed(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCharts = async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;
    const chartData = await dashboardService.getChartData(req.user.libraryId, days);
    res.status(200).json({ success: true, data: chartData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
