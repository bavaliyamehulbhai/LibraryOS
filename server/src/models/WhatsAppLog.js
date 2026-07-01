const mongoose = require("mongoose");

const whatsappLogSchema = new mongoose.Schema({
  messageCode: {
    type: String,
    unique: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member"
  },
  phone: {
    type: String,
    required: true,
    index: true
  },
  templateName: String,
  message: {
    type: String,
    required: true
  },
  providerMessageId: String,
  status: {
    type: String,
    enum: ["PENDING", "SENT", "DELIVERED", "READ", "FAILED"],
    default: "PENDING",
    index: true
  },
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  errorMessage: String,
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true,
    index: true
  },
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification"
  }
}, { timestamps: true });

module.exports = mongoose.model("WhatsAppLog", whatsappLogSchema);
