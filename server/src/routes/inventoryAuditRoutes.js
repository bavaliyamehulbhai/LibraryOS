const express = require("express");
const router = express.Router();
const inventoryAuditController = require("../controllers/inventoryAuditController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

// Get past/current audits
router.get("/", checkPermission([PERMISSIONS.AUDIT_VIEW]), inventoryAuditController.getAuditSessions);

// Get specific audit details
router.get("/:id", checkPermission([PERMISSIONS.AUDIT_VIEW]), inventoryAuditController.getAuditDetails);

// Start new audit
router.post("/start", checkPermission([PERMISSIONS.AUDIT_MANAGE]), inventoryAuditController.startAudit);

// Scan a book in an active audit
router.post("/:id/scan", checkPermission([PERMISSIONS.AUDIT_MANAGE]), inventoryAuditController.scanBook);

// Mark unscanned expected books on a shelf as missing
router.post("/:id/complete-shelf", checkPermission([PERMISSIONS.AUDIT_MANAGE]), inventoryAuditController.completeShelf);

// Close the entire audit session
router.post("/:id/close", checkPermission([PERMISSIONS.AUDIT_MANAGE]), inventoryAuditController.closeSession);

module.exports = router;
