const express = require("express");
const router = express.Router();
const librarySettingsController = require("../controllers/librarySettingsController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// All settings routes require authentication and specific permission
router.use(authMiddleware);

// Library settings management (Typically requires MANAGE_SETTINGS permission)
router.get("/", checkPermission("MANAGE_SETTINGS"), librarySettingsController.getSettings);
router.put("/", checkPermission("MANAGE_SETTINGS"), librarySettingsController.updateSettings);

module.exports = router;
