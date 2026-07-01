const mongoose = require('mongoose');

const notificationTemplateSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  channels: [{
    type: String,
    enum: ["IN_APP", "EMAIL", "SMS", "WHATSAPP", "PUSH"]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Ensure one template per eventType per tenant
notificationTemplateSchema.index({ tenantId: 1, eventType: 1 }, { unique: true });

module.exports = mongoose.model('NotificationTemplate', notificationTemplateSchema);
