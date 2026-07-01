const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const upload = require("../middleware/upload");

const {
  getSettings,
  updateSettings,
  updateBranding,
  updateRules,
  updateNotifications,
  uploadLogo,
  uploadFavicon
} = require("../controllers/settingController");

router.use(authMiddleware);

// Base settings routes
router.get("/", checkPermission("SETTINGS_VIEW"), getSettings);
router.put("/", checkPermission("SETTINGS_UPDATE"), updateSettings);

// Specific sections
router.put("/branding", checkPermission("SETTINGS_UPDATE"), updateBranding);
router.put("/rules", checkPermission("SETTINGS_UPDATE"), updateRules);
router.put("/notifications", checkPermission("SETTINGS_UPDATE"), updateNotifications);

// Uploads
router.post("/logo", checkPermission("SETTINGS_UPDATE"), upload.single("image"), uploadLogo);
router.post("/favicon", checkPermission("SETTINGS_UPDATE"), upload.single("image"), uploadFavicon);

module.exports = router;
