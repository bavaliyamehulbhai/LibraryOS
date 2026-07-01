const Organization = require("../models/Organization");
const Branch = require("../models/Branch");
const crypto = require("crypto");

// Generator function for ORG code
const generateOrganizationCode = async () => {
  const count = await Organization.countDocuments();
  return `ORG-${String(count + 1).padStart(6, '0')}`;
};

// Generator function for BR code
const generateBranchCode = async (organizationId) => {
  const count = await Branch.countDocuments({ organizationId });
  return `BR-${String(count + 1).padStart(6, '0')}`;
};

exports.getOrganizationProfile = async (req, res) => {
  try {
    let org = await Organization.findOne({ libraryId: req.libraryId });
    if (!org) {
      // If it doesn't exist, we create a default placeholder for this tenant
      org = new Organization({
        libraryId: req.libraryId,
        organizationCode: await generateOrganizationCode(),
        name: req.tenant ? req.tenant.name : "My Library", // Use library name if populated in tenantMiddleware
      });
      await org.save();
    }
    res.status(200).json({ success: true, data: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrganizationProfile = async (req, res) => {
  try {
    const { name, email, phone, website, description, address, businessInfo } = req.body;
    let org = await Organization.findOne({ libraryId: req.libraryId });
    
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    if (name) org.name = name;
    if (email) org.email = email;
    if (phone) org.phone = phone;
    if (website) org.website = website;
    if (description) org.description = description;
    
    if (address) {
      org.address = { ...org.address, ...address };
    }
    
    if (businessInfo) {
      org.businessInfo = { ...org.businessInfo, ...businessInfo };
    }

    await org.save();
    res.status(200).json({ success: true, data: org, message: "Profile updated successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBranding = async (req, res) => {
  try {
    const { logo, favicon, primaryColor, secondaryColor } = req.body;
    let org = await Organization.findOne({ libraryId: req.libraryId });
    
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    if (!org.branding) org.branding = {};
    if (logo) org.branding.logo = logo;
    if (favicon) org.branding.favicon = favicon;
    if (primaryColor) org.branding.primaryColor = primaryColor;
    if (secondaryColor) org.branding.secondaryColor = secondaryColor;

    await org.save();
    res.status(200).json({ success: true, data: org.branding, message: "Branding updated successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Branches Management ---

exports.getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ libraryId: req.libraryId });
    res.status(200).json({ success: true, data: branches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBranch = async (req, res) => {
  try {
    const { branchName, address, contactInfo, isHeadOffice } = req.body;
    let org = await Organization.findOne({ libraryId: req.libraryId });
    if (!org) return res.status(404).json({ success: false, message: "Organization not found" });

    const branchCode = await generateBranchCode(org._id);

    const branch = new Branch({
      libraryId: req.libraryId,
      organizationId: org._id,
      branchCode,
      branchName,
      address,
      contactInfo,
      isHeadOffice
    });

    await branch.save();
    res.status(201).json({ success: true, data: branch, message: "Branch created successfully" });
  } catch (error) {
    // Catch duplicate Head Office error
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Only one Head Office branch is allowed." });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};
