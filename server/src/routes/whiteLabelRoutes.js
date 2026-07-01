const express = require("express");
const router = express.Router();
const whiteLabelController = require("../controllers/whiteLabelController");
const authMiddleware = require("../middleware/authMiddleware");

// Public route to get branding for login pages based on domain
router.get("/public", whiteLabelController.getPublicBranding);

// Protected routes
router.use(authMiddleware);

router.get("/", whiteLabelController.getBranding);
router.put("/", whiteLabelController.updateBranding);
router.post("/domain/initiate", whiteLabelController.initiateDomainVerification);
router.post("/domain/verify", whiteLabelController.verifyDomain);

module.exports = router;
