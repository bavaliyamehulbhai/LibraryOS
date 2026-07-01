const Subscription = require("../models/Subscription");
const PlanFeature = require("../models/PlanFeature");
const Feature = require("../models/Feature");
const UsageTracking = require("../models/UsageTracking");
const Plan = require("../models/Plan");

/**
 * Middleware to check if a specific feature is enabled in the tenant's current plan
 */
exports.checkFeature = (featureCode) => {
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({ 
        libraryId: req.libraryId,
        status: "ACTIVE" 
      }).populate('planId');

      if (!subscription) {
        return res.status(403).json({ success: false, message: "No active subscription found." });
      }

      const feature = await Feature.findOne({ featureCode });
      if (!feature) {
        return res.status(404).json({ success: false, message: `Feature ${featureCode} not found in system.` });
      }

      const planFeature = await PlanFeature.findOne({ 
        planId: subscription.planId._id, 
        featureId: feature._id 
      });

      if (!planFeature || !planFeature.enabled) {
        return res.status(403).json({ 
          success: false, 
          message: `Your current plan (${subscription.planId.planName}) does not support ${featureCode}. Please upgrade.` 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

/**
 * Middleware to check usage limits (books, members, branches) before creation
 */
exports.checkUsageLimit = (resourceType) => {
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({ 
        libraryId: req.libraryId,
        status: "ACTIVE" 
      }).populate('planId');

      if (!subscription) {
        return res.status(403).json({ success: false, message: "No active subscription found." });
      }

      const usage = await UsageTracking.findOne({ libraryId: req.libraryId });
      const plan = subscription.planId;

      if (!usage) {
        return res.status(404).json({ success: false, message: "Usage tracking not initialized for tenant." });
      }

      // Check specific limits
      if (resourceType === 'BOOKS' && plan.maxBooks !== -1 && usage.booksUsed >= plan.maxBooks) {
        return res.status(403).json({ success: false, message: `Book limit reached for ${plan.planName} plan.` });
      }

      if (resourceType === 'MEMBERS' && plan.maxMembers !== -1 && usage.membersUsed >= plan.maxMembers) {
        return res.status(403).json({ success: false, message: `Member limit reached for ${plan.planName} plan.` });
      }

      if (resourceType === 'BRANCHES' && plan.maxBranches !== -1 && usage.branchesUsed >= plan.maxBranches) {
        return res.status(403).json({ success: false, message: `Branch limit reached for ${plan.planName} plan.` });
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};
