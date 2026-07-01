const whiteLabelService = require("../services/whiteLabelService");
const mongoose = require("mongoose");

/**
 * Domain Resolver Middleware
 * Intercepts requests, checks the Host header, and resolves custom domains
 * to a specific tenant ID before authentication.
 */
const domainResolver = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return next();
    }

    const hostname = req.hostname;
    const resolvedTenantId = await whiteLabelService.resolveTenantByDomain(hostname);
    
    if (resolvedTenantId) {
      req.resolvedTenantId = resolvedTenantId;
      // In a real application, you might also inject the branding settings here
      // so the frontend can receive them without an extra API call on SSR
    }
    
    next();
  } catch (error) {
    console.error("Domain resolution error:", error);
    next();
  }
};

module.exports = domainResolver;
