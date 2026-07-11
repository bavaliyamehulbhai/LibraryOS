const notificationService = require("../services/notificationService");

exports.getNotifications = async (req, res) => {
  try {
    const libraryId = req.user.libraryId || req.libraryId;
    const notifications = await notificationService.getUserNotifications(req.user._id, libraryId);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.sendBulkAnnouncement = async (req, res) => {
  try {
    // Only SUPER_ADMIN can send system-wide announcements
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { title, message, channel } = req.body;
    
    // Creating a global announcement (no recipientId, no tenantId)
    const notification = await notificationService.sendNotification({
      tenantId: null,
      recipientId: null,
      title,
      message,
      type: "ANNOUNCEMENT",
      channel: channel || "IN_APP"
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getGlobalAnnouncements = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const announcements = await notificationService.getGlobalAnnouncements();
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTemplates = async (req, res) => {
  try {
    const libraryId = req.user.libraryId || req.libraryId;
    const templates = await notificationService.getTemplates(libraryId);
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.upsertTemplate = async (req, res) => {
  try {
    const libraryId = req.user.libraryId || req.libraryId;
    const template = await notificationService.upsertTemplate(libraryId, req.body);
    res.status(200).json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
