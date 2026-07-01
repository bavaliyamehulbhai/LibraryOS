const express = require("express");
const router = express.Router();
const { getProgress, completeStep } = require("../controllers/onboardingController");
const authMiddleware = require("../middleware/authMiddleware");

// Public registration route
router.post("/register", require("../controllers/onboardingController").registerLibrary);

// All onboarding routes require authentication
router.use(authMiddleware);

router.get("/progress", getProgress);
router.post("/step", completeStep);

module.exports = router;
