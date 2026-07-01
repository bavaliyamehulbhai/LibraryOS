const analyticsService = require("../services/readingAnalyticsService");

exports.getDashboardData = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    
    const [overview, topBooks, insights] = await Promise.all([
      analyticsService.getGlobalOverview(libraryId),
      analyticsService.getTopBooks(libraryId),
      analyticsService.generateAIInsights(libraryId)
    ]);
    
    res.json({
      success: true,
      data: { overview, topBooks, insights }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await analyticsService.getReaderLeaderboard(req.user.libraryId);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.simulateData = async (req, res) => {
  try {
    const result = await analyticsService.simulateReadingData(req.user.libraryId, req.user._id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
