const aiAnalyticsService = require("../services/aiAnalyticsService");

exports.getOverview = async (req, res) => {
  try {
    const libraryId = req.user.libraryId || req.libraryId;
    
    // Fetch all insights concurrently
    const [health, forecast, recommendations, summary] = await Promise.all([
       aiAnalyticsService.getLibraryHealthScore(libraryId),
       aiAnalyticsService.getDemandForecast(libraryId),
       aiAnalyticsService.getAcquisitionRecommendations(libraryId),
       aiAnalyticsService.getAIExecutiveSummary(libraryId)
    ]);

    res.json({
       success: true,
       data: {
          health,
          forecast,
          recommendations,
          summary
       }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
