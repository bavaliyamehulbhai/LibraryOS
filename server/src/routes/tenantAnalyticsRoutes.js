const express = require("express");
const router = express.Router();
const tenantAnalyticsController = require("../controllers/tenantAnalyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// All routes require authentication and LIBRARY_ADMIN or above
router.use(authMiddleware);

// Only LIBRARY_ADMIN should view their analytics (and SUPER_ADMIN testing)
router.get("/", checkPermission("VIEW_DASHBOARD"), tenantAnalyticsController.getAnalytics);

module.exports = router;
