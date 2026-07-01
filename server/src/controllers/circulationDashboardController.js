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
    // Generate some mock trend data for now until a robust timeseries aggregation is built
    const chartData = [
      { name: 'Mon', issues: 40, returns: 24, fines: 2400 },
      { name: 'Tue', issues: 30, returns: 13, fines: 2210 },
      { name: 'Wed', issues: 20, returns: 98, fines: 2290 },
      { name: 'Thu', issues: 27, returns: 39, fines: 2000 },
      { name: 'Fri', issues: 18, returns: 48, fines: 2181 },
      { name: 'Sat', issues: 23, returns: 38, fines: 2500 },
      { name: 'Sun', issues: 34, returns: 43, fines: 2100 },
    ];
    res.status(200).json({ success: true, data: chartData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
