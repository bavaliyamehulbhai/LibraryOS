const express = require("express");
const router = express.Router();
const automationSettingsController = require("../controllers/automationSettingsController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

// Only admins with MANAGE_SETTINGS should be able to update these rules
router.get("/", checkPermission([PERMISSIONS.MANAGE_SETTINGS]), automationSettingsController.getSettings);
router.put("/", checkPermission([PERMISSIONS.MANAGE_SETTINGS]), automationSettingsController.updateSettings);

module.exports = router;
