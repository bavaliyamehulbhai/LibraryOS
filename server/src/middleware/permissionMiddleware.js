const User = require("../models/User");
const auditService = require("../services/auditService");

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const user = await User.findById(req.user.id || req.user._id).populate({
        path: 'roleId',
        populate: { path: 'permissions' }
      });

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      // Super admins and library admins always have full access — bypass RBAC completely
      if (["SUPER_ADMIN", "LIBRARY_ADMIN"].includes(user.role)) {
        return next();
      }

      // Legacy compatibility: bypass RBAC if no custom RBAC roleId is assigned yet
      const hasLegacyRoleOnly = !user.roleId;
      if (hasLegacyRoleOnly && ["LIBRARIAN", "ASSISTANT", "STUDENT", "MEMBER"].includes(user.role)) {
        return next();
      }

      if (!user.roleId || !Array.isArray(user.roleId.permissions)) {
        await auditService.createSecurityLog({
          event: "UNAUTHORIZED_ACCESS",
          severity: "MEDIUM",
          userId: user._id,
          libraryId: user.libraryId,
          ipAddress: req.ip,
          details: `User attempted access without an assigned role to: ${req.originalUrl}`
        });
        return res.status(403).json({ success: false, message: "Access denied. No role assigned. Please contact your Library Admin." });
      }

      let hasPermission = false;

      if (Array.isArray(requiredPermission)) {
        hasPermission = user.roleId.permissions.some(p => requiredPermission.includes(p.name));
      } else {
        hasPermission = user.roleId.permissions.some(p => p.name === requiredPermission);
      }

      if (!hasPermission) {
        await auditService.createSecurityLog({
          event: "PERMISSION_DENIED",
          severity: "HIGH",
          userId: user._id,
          libraryId: user.libraryId,
          ipAddress: req.ip,
          details: `User denied access to ${req.originalUrl}. Missing permission: ${requiredPermission}`
        });
        return res.status(403).json({ success: false, message: "Forbidden. You don't have the required permissions." });
      }

      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
};

module.exports = checkPermission;
