const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

router.get("/dashboard", checkPermission([PERMISSIONS.REPORT_VIEW]), reportController.getExecutiveDashboard);
router.get("/ai-insights", checkPermission([PERMISSIONS.REPORT_VIEW]), reportController.getAiInsights);

module.exports = router;
