const AuditLog = require("../models/AuditLog");
const ActivityLog = require("../models/ActivityLog");
const SecurityLog = require("../models/SecurityLog");
const socket = require("../socket");

exports.createAuditLog = async (data) => {
  try {
    const log = await AuditLog.create(data);
    return log;
  } catch (error) {
    console.error("Audit Log Error:", error);
  }
};

exports.createActivityLog = async (data) => {
  try {
    const log = await ActivityLog.create(data);
    try {
      const io = socket.getIO();
      // Emit to a room specific to the library
      io.emit(`activity:${data.libraryId}`, log);
    } catch(err) {} // socket not initialized or error
    return log;
  } catch (error) {
    console.error("Activity Log Error:", error);
  }
};

exports.createSecurityLog = async (data) => {
  try {
    const log = await SecurityLog.create(data);
    
    // Check for multiple failed logins
    if (data.event === "FAILED_LOGIN" && data.userId) {
      const recentFails = await SecurityLog.countDocuments({
        event: "FAILED_LOGIN",
        userId: data.userId,
        createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // last 15 mins
      });

      if (recentFails >= 5) {
        await SecurityLog.create({
          event: "MULTIPLE_FAILED_LOGINS",
          severity: "CRITICAL",
          userId: data.userId,
          ipAddress: data.ipAddress,
          libraryId: data.libraryId,
          details: `User exceeded 5 failed logins within 15 minutes.`
        });
      }
    }
    return log;
  } catch (error) {
    console.error("Security Log Error:", error);
  }
};

exports.getAuditStats = async (libraryId) => {
  const totalLogs = await AuditLog.countDocuments({ libraryId });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayLogs = await ActivityLog.countDocuments({ libraryId, createdAt: { $gte: today } });
  const securityEvents = await SecurityLog.countDocuments({ libraryId, severity: { $in: ["HIGH", "CRITICAL"] } });

  return { totalLogs, todayLogs, securityEvents };
};
