const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/readingAnalyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

router.get("/dashboard", checkPermission([PERMISSIONS.READING_ANALYTICS_VIEW]), analyticsController.getDashboardData);
router.get("/leaderboard", checkPermission([PERMISSIONS.READING_ANALYTICS_VIEW]), analyticsController.getLeaderboard);

// For demo/interview purposes
router.post("/simulate", checkPermission([PERMISSIONS.READING_ANALYTICS_VIEW]), analyticsController.simulateData);

module.exports = router;
