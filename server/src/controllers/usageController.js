const usageTrackingService = require("../services/usageTrackingService");

exports.getUsageOverview = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const usage = await usageTrackingService.getUsageOverview(libraryId);

    res.status(200).json({
      success: true,
      data: usage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
