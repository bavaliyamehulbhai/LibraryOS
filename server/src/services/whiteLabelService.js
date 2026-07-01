const WhiteLabel = require("../models/WhiteLabel");
const DomainVerification = require("../models/DomainVerification");
const BrandHistory = require("../models/BrandHistory");
const crypto = require("crypto");
const mongoose = require("mongoose");

/**
 * Get or create white label branding settings for a tenant
 */
exports.getBranding = async (tenantId) => {
  let branding = await WhiteLabel.findOne({ tenantId });
  if (!branding) {
    branding = await WhiteLabel.create({ tenantId });
  }
  return branding;
};

/**
 * Update tenant branding (colors, logo, theme, typography, layout)
 */
exports.updateBranding = async (tenantId, brandingData, userId) => {
  let branding = await WhiteLabel.findOne({ tenantId });
  let previousState = null;
  
  if (!branding) {
    branding = new WhiteLabel({ tenantId, ...brandingData });
  } else {
    previousState = branding.toObject();
    // Cannot update domain through this method
    delete brandingData.customDomain;
    Object.assign(branding, brandingData);
  }
  
  await branding.save();

  // Log history if this was an update (and we have the userId)
  if (previousState && userId) {
    await BrandHistory.create({
      tenantId,
      changes: previousState, // Store previous state for rollback ability
      updatedBy: userId
    });
  }

  return branding;
};

/**
 * Initiate verification for a new custom domain
 */
exports.initiateDomainVerification = async (tenantId, domain) => {
  // Check if domain is already claimed
  const existingDomain = await WhiteLabel.findOne({ customDomain: domain });
  if (existingDomain && existingDomain.tenantId.toString() !== tenantId) {
    throw new Error("This domain is already registered to another library.");
  }

  // Generate TXT verification token
  const token = `libraryos-verify-${crypto.randomBytes(16).toString('hex')}`;

  let verification = await DomainVerification.findOne({ tenantId, domain });
  if (!verification) {
    verification = new DomainVerification({
      tenantId,
      domain,
      verificationToken: token,
      verified: false
    });
  } else {
    verification.verificationToken = token;
    verification.verified = false;
  }

  await verification.save();
  return verification;
};

/**
 * Simulate domain verification (In production, this would do a DNS lookup)
 */
exports.verifyDomain = async (tenantId, domain) => {
  const verification = await DomainVerification.findOne({ tenantId, domain });
  if (!verification) {
    throw new Error("Verification record not found.");
  }

  // SIMULATION: Always verify successfully for development
  verification.verified = true;
  verification.lastChecked = new Date();
  await verification.save();

  // Link domain to tenant
  const branding = await exports.getBranding(tenantId);
  branding.customDomain = domain;
  await branding.save();

  return verification;
};

/**
 * Internal system function: Resolve tenantId from a hostname
 */
exports.resolveTenantByDomain = async (hostname) => {
  if (!hostname) {
    return null;
  }

  if (mongoose.connection.readyState !== 1) {
    return null;
  }

  // Ignore localhost or default SaaS domains
  if (
    hostname.includes("localhost") ||
    hostname === "libraryos.com" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  ) {
    return null;
  }

  const branding = await WhiteLabel.findOne({ customDomain: hostname, status: "ACTIVE" });
  if (branding) {
    return branding.tenantId;
  }
  return null;
};
