const express = require("express");
const router = express.Router();
const trialController = require("../controllers/trialController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

// Tenant routes
router.get("/status", checkPermission("MANAGE_SETTINGS"), trialController.getStatus);
router.post("/convert", checkPermission("MANAGE_SETTINGS"), trialController.convertTrial);

// Super Admin routes
router.get("/analytics", checkPermission("SUPER_ADMIN"), trialController.getAnalytics);
router.put("/extend", checkPermission("SUPER_ADMIN"), trialController.extendTrial);

module.exports = router;
