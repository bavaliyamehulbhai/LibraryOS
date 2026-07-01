const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

// Organization Profile Routes
router.get("/profile", checkPermission("ORG_VIEW", "MANAGE_SETTINGS"), organizationController.getOrganizationProfile);
router.put("/profile", checkPermission("ORG_UPDATE", "MANAGE_SETTINGS"), organizationController.updateOrganizationProfile);
router.put("/branding", checkPermission("ORG_UPDATE", "MANAGE_SETTINGS"), organizationController.updateBranding);

// Branch Management Routes
router.get("/branches", checkPermission("ORG_VIEW", "MANAGE_SETTINGS"), organizationController.getBranches);
router.post("/branches", checkPermission("ORG_UPDATE", "MANAGE_SETTINGS"), organizationController.createBranch);

module.exports = router;
