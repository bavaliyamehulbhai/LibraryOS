const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/whatsappController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Admin Routes
router.use(authMiddleware);

router.get("/dashboard", checkPermission("MANAGE_SETTINGS"), ctrl.getDashboard);
router.get("/logs", checkPermission("MANAGE_SETTINGS"), ctrl.getLogs);

router.get("/templates", checkPermission("MANAGE_SETTINGS"), ctrl.getTemplates);
router.put("/templates", checkPermission("MANAGE_SETTINGS"), ctrl.upsertTemplate);

module.exports = router;
