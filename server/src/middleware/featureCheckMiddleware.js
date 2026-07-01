const featureService = require("../services/featureService");

/**
 * Express middleware to protect a route behind a specific feature flag.
 * @param {String} featureCode - The unique feature identifier (e.g., 'ADVANCED_ANALYTICS')
 */
const featureCheck = (featureCode) => {
  return async (req, res, next) => {
    try {
      // In multi-tenant architecture, Super Admins typically bypass feature checks
      if (req.user && req.user.role === 'SUPER_ADMIN') {
        return next();
      }

      const libraryId = req.user.libraryId || req.libraryId;
      if (!libraryId) {
        return res.status(401).json({ success: false, message: "Library context missing" });
      }

      const hasAccess = await featureService.checkFeature(libraryId, featureCode);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: `Your current plan does not support the '${featureCode}' feature. Please upgrade your plan to access this functionality.`
        });
      }

      next();
    } catch (error) {
      console.error(`Feature check error for ${featureCode}:`, error);
      res.status(500).json({ success: false, message: "Internal server error during feature validation" });
    }
  };
};

module.exports = featureCheck;
