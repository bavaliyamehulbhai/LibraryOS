const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/circulationDashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Require VIEW_DASHBOARD permission
router.use(authMiddleware, checkPermission("VIEW_DASHBOARD"));

router.get("/", ctrl.getDashboard);
router.get("/feed", ctrl.getFeed);
router.get("/charts", ctrl.getCharts);

module.exports = router;
