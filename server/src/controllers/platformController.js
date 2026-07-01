const Organization = require("../models/Organization");
const User = require("../models/User");
const UsageMetric = require("../models/UsageMetric");
const PlatformAuditLog = require("../models/PlatformAuditLog");

const getPlatformStats = async (req, res) => {
  try {
    const totalLibraries = await Organization.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // For MVP, aggregate mock metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metrics = await UsageMetric.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: null, totalApi: { $sum: "$apiCalls" }, totalStorage: { $sum: "$storageUsedGB" } } }
    ]);

    const activeSubscriptions = await Organization.countDocuments({ status: "ACTIVE" });
    const suspendedTenants = await Organization.countDocuments({ status: "SUSPENDED" });

    res.json({
      success: true,
      stats: {
        totalLibraries,
        totalUsers,
        activeSubscriptions,
        suspendedTenants,
        totalApiToday: metrics[0]?.totalApi || 0,
        totalStorageGB: metrics[0]?.totalStorage || 0,
        revenueARR: 1500000 // Mock
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTenants = async (req, res) => {
  try {
    const tenants = await Organization.find().select("name slug status healthScore createdAt").sort({ createdAt: -1 });
    res.json({ success: true, tenants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const suspendTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const org = await Organization.findByIdAndUpdate(id, { status: "SUSPENDED" }, { new: true });
    
    if (!org) return res.status(404).json({ success: false, message: "Tenant not found" });

    await PlatformAuditLog.create({
      action: "SUSPEND_TENANT",
      adminId: req.user.id,
      targetOrganizationId: id,
      metadata: { previousStatus: "ACTIVE" }
    });

    res.json({ success: true, message: "Tenant suspended successfully", tenant: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const reactivateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const org = await Organization.findByIdAndUpdate(id, { status: "ACTIVE" }, { new: true });
    
    if (!org) return res.status(404).json({ success: false, message: "Tenant not found" });

    await PlatformAuditLog.create({
      action: "REACTIVATE_TENANT",
      adminId: req.user.id,
      targetOrganizationId: id,
      metadata: { previousStatus: "SUSPENDED" }
    });

    res.json({ success: true, message: "Tenant reactivated successfully", tenant: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPlatformStats,
  getTenants,
  suspendTenant,
  reactivateTenant
};
