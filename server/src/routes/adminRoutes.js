const express = require("express");
const router = express.Router();
const { getDashboardStats, globalSearch } = require("../controllers/adminDashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// All admin routes require SUPER_ADMIN
router.use(authMiddleware, authorize("SUPER_ADMIN"));

router.get("/dashboard", getDashboardStats);
router.get("/search", globalSearch);

module.exports = router;
