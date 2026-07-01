const express = require("express");
const router = express.Router();
const usageController = require("../controllers/usageController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Only LIBRARY_ADMIN should view their usage (and SUPER_ADMIN testing)
router.get("/", usageController.getUsageOverview);

module.exports = router;
