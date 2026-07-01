const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    index: true // Optional if global broadcast
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["BOOK_DUE", "BOOK_RETURNED", "FINE_CREATED", "MEMBER_CREATED", "SUBSCRIPTION_EXPIRING", "PAYMENT_SUCCESS", "SYSTEM_ALERT", "ANNOUNCEMENT"],
    default: "SYSTEM_ALERT"
  },
  channel: {
    type: String,
    enum: ["IN_APP", "EMAIL", "SMS", "WHATSAPP", "PUSH"],
    default: "IN_APP"
  },
  status: {
    type: String,
    enum: ["PENDING", "SENT", "DELIVERED", "FAILED", "READ"],
    default: "SENT" // For in-app it's mostly "SENT" initially
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true // Target specific user. If null and tenantId present, means all tenant users. If both null, all system users.
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
