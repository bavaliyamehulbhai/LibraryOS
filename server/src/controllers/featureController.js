const featureService = require("../services/featureService");

exports.getMyFeatures = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    if (!libraryId) {
      return res.status(400).json({ success: false, message: "Missing library context" });
    }

    const features = await featureService.getTenantFeatures(libraryId);

    res.status(200).json({
      success: true,
      data: features
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
