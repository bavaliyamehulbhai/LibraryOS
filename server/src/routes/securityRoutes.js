const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const hasPermission = require("../middleware/permissionMiddleware");

const {
  getSecurityMetrics,
  getSecurityAlerts,
  getLoginActivity,
  getLoginTrends
} = require("../controllers/securityController");

// Protect all routes with authentication and VIEW_SECURITY permission
router.use(authMiddleware);
router.use(hasPermission("VIEW_SECURITY"));

router.get("/dashboard", getSecurityMetrics);
router.get("/alerts", getSecurityAlerts);
router.get("/activity", getLoginActivity);
router.get("/trends", getLoginTrends);

module.exports = router;
