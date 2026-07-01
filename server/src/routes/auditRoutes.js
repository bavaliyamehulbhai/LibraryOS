const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

// Audit & Activity Logs
router.get("/logs", checkPermission("AUDIT_VIEW"), auditController.getAuditLogs);
router.get("/activity", checkPermission("AUDIT_VIEW"), auditController.getActivityLogs);
router.get("/security", checkPermission("SECURITY_VIEW"), auditController.getSecurityLogs);
router.get("/stats", checkPermission("AUDIT_VIEW"), auditController.getStats);
router.get("/compliance-report", checkPermission("COMPLIANCE_VIEW"), auditController.getComplianceReport);

module.exports = router;
