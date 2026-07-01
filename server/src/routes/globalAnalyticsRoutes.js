const express = require("express");
const router = express.Router();
const globalAnalyticsController = require("../controllers/globalAnalyticsController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require SUPER_ADMIN
router.use(authMiddleware);

router.get("/overview", globalAnalyticsController.getOverview);
router.get("/revenue-trend", globalAnalyticsController.getRevenueTrend);
router.get("/plan-distribution", globalAnalyticsController.getPlanDistribution);

module.exports = router;
