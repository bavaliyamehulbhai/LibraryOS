const Library = require("../models/Library");
const User = require("../models/User");
const Branch = require("../models/Branch");
const AuditLog = require("../models/AuditLog");
const Subscription = require("../models/Subscription");
const Usage = require("../models/Usage");
const { calculateCurrentRevenue } = require("../services/revenueService");

const getDashboardStats = async (req, res) => {
  try {
    // 1. Core Counts
    const totalLibraries = await Library.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalBranches = await Branch.countDocuments({ isActive: true });
    const activeSubscriptions = await Library.countDocuments({ status: "ACTIVE" });
    const trialLibraries = await Library.countDocuments({ status: "TRIAL" });
    const revenue = await calculateCurrentRevenue();

    // 2. Recent Activities
    const recentActivities = await AuditLog.find()
      .populate("libraryId", "name")
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 3. Recent Libraries
    const recentLibraries = await Library.find()
      .populate("subscriptionId", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 4. Subscription Distribution
    const libraries = await Library.find({ isActive: true }).populate("subscriptionId").lean();
    const subDistribution = {};
    libraries.forEach(lib => {
      if (lib.subscriptionId && lib.subscriptionId.name) {
        const planName = lib.subscriptionId.name;
        subDistribution[planName] = (subDistribution[planName] || 0) + 1;
      }
    });

    // 5. System Health
    const systemHealth = {
      database: "Healthy",
      api: "Healthy",
      server: "Healthy"
    };

    return res.json({
      success: true,
      data: {
        totalLibraries,
        totalUsers,
        totalBranches,
        activeSubscriptions,
        trialLibraries,
        revenue,
        recentActivities,
        recentLibraries,
        subscriptionDistribution: subDistribution,
        systemHealth
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const globalSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json({ success: true, data: { libraries: [], users: [], branches: [] } });
    }

    const regex = new RegExp(query, "i");

    const libraries = await Library.find({ name: regex, isActive: true }).limit(5).lean();
    const users = await User.find({ $or: [{ name: regex }, { email: regex }], isActive: true }).limit(5).lean();
    const branches = await Branch.find({ name: regex, isActive: true }).limit(5).lean();

    return res.json({
      success: true,
      data: {
        libraries,
        users,
        branches
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  globalSearch
};
