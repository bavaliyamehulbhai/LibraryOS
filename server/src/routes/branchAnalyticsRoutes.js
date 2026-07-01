const express = require("express");
const router = express.Router();
const branchAnalyticsController = require("../controllers/branchAnalyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const auditMiddleware = require("../middleware/auditMiddleware");

router.use(authMiddleware);
router.use(authorize("SUPER_ADMIN", "LIBRARY_ADMIN"));

router.get("/overview", branchAnalyticsController.getOverview);
router.get("/comparison", auditMiddleware("COMPARISON_VIEWED"), branchAnalyticsController.getComparison);
router.get("/ranking", branchAnalyticsController.getRanking);
router.get("/growth", branchAnalyticsController.getGrowth);
router.get("/reports/export", auditMiddleware("REPORT_GENERATED"), branchAnalyticsController.generateReport);

module.exports = router;
