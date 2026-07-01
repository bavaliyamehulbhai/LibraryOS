const whiteLabelService = require("../services/whiteLabelService");

exports.getBranding = async (req, res) => {
  try {
    const libraryId = req.user.libraryId || req.libraryId;
    const branding = await whiteLabelService.getBranding(libraryId);
    res.status(200).json({ success: true, data: branding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBranding = async (req, res) => {
  try {
    const libraryId = req.user.libraryId || req.libraryId;
    const userId = req.user._id;
    const branding = await whiteLabelService.updateBranding(libraryId, req.body, userId);
    res.status(200).json({ success: true, data: branding });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.initiateDomainVerification = async (req, res) => {
  try {
    const libraryId = req.user.libraryId || req.libraryId;
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ success: false, message: "Domain is required." });
    }

    const verification = await whiteLabelService.initiateDomainVerification(libraryId, domain);
    res.status(200).json({ success: true, data: verification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyDomain = async (req, res) => {
  try {
    const libraryId = req.user.libraryId || req.libraryId;
    const { domain } = req.body;

    const verification = await whiteLabelService.verifyDomain(libraryId, domain);
    res.status(200).json({ success: true, data: verification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPublicBranding = async (req, res) => {
  try {
    // Determine tenant from domain if possible
    const hostname = req.hostname;
    const resolvedTenantId = await whiteLabelService.resolveTenantByDomain(hostname);
    
    if (resolvedTenantId) {
      const branding = await whiteLabelService.getBranding(resolvedTenantId);
      return res.status(200).json({ success: true, data: branding });
    }
    
    res.status(200).json({ success: true, data: null }); // Default branding
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
