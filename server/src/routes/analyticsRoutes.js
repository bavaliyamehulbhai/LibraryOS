const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);
router.use(checkPermission("ANALYTICS_VIEW"));

router.get("/dashboard", analyticsController.getDashboard);
router.get("/books", analyticsController.getBooks);
router.get("/categories", analyticsController.getCategories);
router.get("/inventory", analyticsController.getInventory);
router.get("/trends", analyticsController.getTrends);
router.get("/executive-report", analyticsController.getExecutiveReport);

module.exports = router;
