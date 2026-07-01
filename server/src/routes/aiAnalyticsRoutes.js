const express = require("express");
const router = express.Router();
const aiAnalyticsController = require("../controllers/aiAnalyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

router.get("/overview", checkPermission([PERMISSIONS.AI_ANALYTICS_VIEW]), aiAnalyticsController.getOverview);

module.exports = router;
