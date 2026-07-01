const tenantAnalyticsService = require("../services/tenantAnalyticsService");

exports.getAnalytics = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;

    const overview = await tenantAnalyticsService.getTenantOverview(libraryId);
    const growth = await tenantAnalyticsService.getGrowthAnalytics(libraryId);
    const engagement = await tenantAnalyticsService.getEngagementAnalytics(libraryId);

    res.status(200).json({
      success: true,
      data: {
        overview,
        growth,
        engagement
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
