const express = require("express");
const router = express.Router();
const featureController = require("../controllers/featureController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Return features allowed for the currently logged in library
router.get("/my-access", featureController.getMyFeatures);

module.exports = router;
