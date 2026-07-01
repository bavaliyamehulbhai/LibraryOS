const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

// Anyone logged in can view the dashboard (roles are handled on frontend via RoleRoute or generic view)
router.get("/master", dashboardController.getDashboardMaster);

module.exports = router;
