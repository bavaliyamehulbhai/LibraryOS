const LoginActivity = require("../models/LoginActivity");
const SecurityAlert = require("../models/SecurityAlert");
const Session = require("../models/Session");
const User = require("../models/User");

// @desc    Get security metrics
// @route   GET /api/v1/security/dashboard
// @access  Private (SUPER_ADMIN, LIBRARY_ADMIN)
const getSecurityMetrics = async (req, res) => {
  try {
    const filter = req.user.role === "SUPER_ADMIN" ? {} : { libraryId: req.user.libraryId };

    const totalLogins = await LoginActivity.countDocuments({ ...filter, status: "SUCCESS" });
    const failedLogins = await LoginActivity.countDocuments({ ...filter, status: { $in: ["FAILED", "LOCKED"] } });
    const activeSessions = await Session.countDocuments({ isActive: true }); // Sessions don't have libraryId currently, but we can filter users
    
    // For locked users
    const lockedUsers = await User.countDocuments({ ...filter, lockUntil: { $gt: new Date() } });

    res.json({
      success: true,
      data: {
        totalLogins,
        failedLogins,
        lockedUsers,
        activeSessions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active security alerts
// @route   GET /api/v1/security/alerts
// @access  Private
const getSecurityAlerts = async (req, res) => {
  try {
    const filter = req.user.role === "SUPER_ADMIN" ? {} : { libraryId: req.user.libraryId };
    
    const alerts = await SecurityAlert.find(filter).sort({ createdAt: -1 }).limit(20);

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent login activity
// @route   GET /api/v1/security/activity
// @access  Private
const getLoginActivity = async (req, res) => {
  try {
    const filter = req.user.role === "SUPER_ADMIN" ? {} : { libraryId: req.user.libraryId };
    
    const activity = await LoginActivity.find(filter)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get login trends (last 30 days)
// @route   GET /api/v1/security/trends
// @access  Private
const getLoginTrends = async (req, res) => {
  try {
    const filter = req.user.role === "SUPER_ADMIN" ? {} : { libraryId: req.user.libraryId };
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await LoginActivity.aggregate([
      { 
        $match: { 
          ...filter,
          status: "SUCCESS", 
          createdAt: { $gte: thirtyDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: trends.map(t => ({ day: t._id, count: t.count }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSecurityMetrics,
  getSecurityAlerts,
  getLoginActivity,
  getLoginTrends
};
