const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/memberAnalyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Require VIEW_REPORTS permission
router.use(authMiddleware, checkPermission("VIEW_REPORTS"));

router.get("/dashboard", ctrl.getDashboard);
router.get("/members", ctrl.getMembers);
router.get("/reading", ctrl.getReading);
router.get("/risk", ctrl.getRisk);

module.exports = router;
