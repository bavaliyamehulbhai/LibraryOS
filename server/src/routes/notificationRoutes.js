const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", notificationController.getNotifications);
router.put("/read-all", notificationController.markAllAsRead);
router.put("/:id/read", notificationController.markAsRead);

// Admin bulk announcements
router.post("/bulk", notificationController.sendBulkAnnouncement);

// Notification templates
router.get("/templates", notificationController.getTemplates);
router.put("/templates", notificationController.upsertTemplate);

module.exports = router;
