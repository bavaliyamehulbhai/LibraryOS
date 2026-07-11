const Notification = require("../models/Notification");
const NotificationTemplate = require("../models/NotificationTemplate");

/**
 * Creates and dispatches a notification
 * In a production app, this would route to Email/SMS providers based on `channel`.
 */
exports.sendNotification = async (data) => {
  const notification = new Notification({
    tenantId: data.tenantId,
    title: data.title,
    message: data.message,
    type: data.type || "SYSTEM_ALERT",
    channel: data.channel || "IN_APP",
    recipientId: data.recipientId,
    status: data.channel === "IN_APP" ? "SENT" : "PENDING"
  });

  await notification.save();

  // Mocking external delivery
  if (data.channel !== "IN_APP") {
    console.log(`[NotificationEngine] Simulating ${data.channel} dispatch to User ${data.recipientId}: ${data.title}`);
    
    // Simulate successful delivery
    setTimeout(async () => {
      notification.status = "DELIVERED";
      await notification.save();
    }, 1000);
  }

  return notification;
};

/**
 * Get notifications for a specific user
 */
exports.getUserNotifications = async (userId, tenantId = null) => {
  const query = { 
    $or: [
      { recipientId: userId },
      { recipientId: null, tenantId: tenantId }, // Global tenant announcements
      { recipientId: null, tenantId: null }      // System-wide global announcements
    ],
    channel: "IN_APP"
  };

  return await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(50); // Get latest 50
};

/**
 * Get all global announcements sent by admins
 */
exports.getGlobalAnnouncements = async () => {
  return await Notification.find({ type: "ANNOUNCEMENT" })
    .sort({ createdAt: -1 })
    .limit(50);
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId });
  if (!notification) throw new Error("Notification not found");

  // Basic authorization check could be added here
  notification.status = "READ";
  await notification.save();
  return notification;
};

/**
 * Mark all user notifications as read
 */
exports.markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipientId: userId, channel: "IN_APP", status: { $ne: "READ" } },
    { $set: { status: "READ" } }
  );
  return { success: true };
};

/**
 * Get notification templates for a library/tenant
 */
exports.getTemplates = async (tenantId) => {
  return await NotificationTemplate.find({ tenantId });
};

/**
 * Upsert a notification template
 */
exports.upsertTemplate = async (tenantId, templateData) => {
  const { eventType, name, subject, message, channels, isActive } = templateData;
  
  const template = await NotificationTemplate.findOneAndUpdate(
    { tenantId, eventType },
    { name, subject, message, channels, isActive },
    { new: true, upsert: true }
  );
  
  return template;
};
