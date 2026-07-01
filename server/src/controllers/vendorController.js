const Vendor = require("../models/Vendor");
const vendorAnalyticsService = require("../services/vendorAnalyticsService");

exports.getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ rating: -1 });
    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVendorDetails = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVendorInsights = async (req, res) => {
  try {
    const insights = await vendorAnalyticsService.generateVendorInsights(req.params.id);
    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
