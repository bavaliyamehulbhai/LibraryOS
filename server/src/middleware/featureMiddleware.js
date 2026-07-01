const Library = require("../models/Library");
const Subscription = require("../models/Subscription");

const checkFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const libraryId = req.user.libraryId;
      if (!libraryId) {
        return res.status(403).json({ success: false, message: "Library ID missing" });
      }

      const library = await Library.findById(libraryId).lean();
      if (!library || !library.subscriptionId) {
        return res.status(403).json({ success: false, message: "No active subscription found" });
      }

      const plan = await Subscription.findById(library.subscriptionId).lean();
      if (!plan) {
        return res.status(403).json({ success: false, message: "Subscription plan not found" });
      }

      if (plan.features.includes("ALL_FEATURES") || plan.features.includes(featureName)) {
        return next();
      }

      return res.status(403).json({ 
        success: false, 
        message: `Feature '${featureName}' is not available in your current plan. Please upgrade.` 
      });

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
};

module.exports = { checkFeature };
