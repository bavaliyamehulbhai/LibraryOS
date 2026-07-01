const Feature = require("../models/Feature");
const PlanFeature = require("../models/PlanFeature");
const TenantFeature = require("../models/TenantFeature");
const Subscription = require("../models/Subscription");

/**
 * Checks if a feature is enabled for a given tenant.
 * Priority: 1. Tenant Override -> 2. Plan Access -> 3. Default False
 */
exports.checkFeature = async (tenantId, featureCode) => {
  // 1. Find the feature
  const feature = await Feature.findOne({ featureCode: featureCode.toUpperCase(), status: { $ne: 'DEPRECATED' } });
  if (!feature) return false;

  // 2. Check for Tenant Override (Highest Priority)
  const tenantOverride = await TenantFeature.findOne({ tenantId, featureId: feature._id });
  if (tenantOverride) {
    return tenantOverride.enabled;
  }

  // 3. Fallback to Plan Feature
  const activeSubscription = await Subscription.findOne({ libraryId: tenantId, status: 'ACTIVE' });
  if (!activeSubscription) return false;

  const planFeature = await PlanFeature.findOne({ planId: activeSubscription.planId, featureId: feature._id });
  
  if (planFeature && planFeature.enabled) {
    return true;
  }

  return false;
};

/**
 * Returns all enabled feature codes for a specific tenant.
 * Useful for the frontend to hide/show UI elements.
 */
exports.getTenantFeatures = async (tenantId) => {
  const activeSubscription = await Subscription.findOne({ libraryId: tenantId, status: 'ACTIVE' });
  let planFeatureIds = [];
  
  if (activeSubscription) {
    const planFeatures = await PlanFeature.find({ planId: activeSubscription.planId, enabled: true });
    planFeatureIds = planFeatures.map(pf => pf.featureId.toString());
  }

  // Get tenant overrides
  const overrides = await TenantFeature.find({ tenantId });
  const overriddenEnabledIds = overrides.filter(o => o.enabled).map(o => o.featureId.toString());
  const overriddenDisabledIds = overrides.filter(o => !o.enabled).map(o => o.featureId.toString());

  // Combine
  let finalFeatureIds = [...new Set([...planFeatureIds, ...overriddenEnabledIds])];
  finalFeatureIds = finalFeatureIds.filter(id => !overriddenDisabledIds.includes(id));

  // Fetch actual feature codes
  const features = await Feature.find({ _id: { $in: finalFeatureIds }, status: { $ne: 'DEPRECATED' } });
  
  return features.map(f => f.featureCode);
};
