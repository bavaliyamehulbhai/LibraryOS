const AuditLog = require("../models/AuditLog");
const ActivityLog = require("../models/ActivityLog");
const SecurityLog = require("../models/SecurityLog");
const auditService = require("../services/auditService");

exports.getAuditLogs = async (req, res) => {
  try {
    const { action, module, userId, limit = 50, page = 1 } = req.query;
    const query = { libraryId: req.user.libraryId };
    if (action) query.action = action;
    if (module) query.entity = module;
    if (userId) query.userId = userId;

    const logs = await AuditLog.find(query)
      .populate("userId performedBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({ success: true, data: logs, pagination: { total, page: Number(page), pages: Math.ceil(total/limit) } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ libraryId: req.user.libraryId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getSecurityLogs = async (req, res) => {
  try {
    const logs = await SecurityLog.find({ libraryId: req.user.libraryId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await auditService.getAuditStats(req.user.libraryId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getComplianceReport = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    
    // Aggregate a compliance summary
    const securityEvents = await SecurityLog.find({ libraryId, severity: { $in: ["HIGH", "CRITICAL"] } }).populate("userId", "name email").limit(20);
    const recentEdits = await AuditLog.find({ libraryId, action: { $in: ["BOOK_UPDATED", "USER_UPDATED", "BOOK_DELETED"] } }).populate("performedBy", "name").sort({ createdAt: -1 }).limit(20);
    const activeUsers = await ActivityLog.aggregate([
      { $match: { libraryId: req.user.libraryId } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { name: "$user.name", count: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        securityEvents,
        recentEdits,
        activeUsers
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
