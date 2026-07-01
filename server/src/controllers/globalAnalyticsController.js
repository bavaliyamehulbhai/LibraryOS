const globalAnalyticsService = require("../services/globalAnalyticsService");

exports.getOverview = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ success: false, message: "Unauthorized: Super Admin access required." });
    }
    const overview = await globalAnalyticsService.getGlobalOverview();
    res.status(200).json({ success: true, data: overview });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getRevenueTrend = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const trend = await globalAnalyticsService.getRevenueTrend();
    res.status(200).json({ success: true, data: trend });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPlanDistribution = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const distribution = await globalAnalyticsService.getPlanDistribution();
    res.status(200).json({ success: true, data: distribution });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
