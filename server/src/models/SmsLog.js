const mongoose = require("mongoose");

const smsLogSchema = new mongoose.Schema({
  smsCode: {
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
  message: {
    type: String,
    required: true
  },
  provider: {
    type: String, // 'TWILIO', 'MSG91', 'MOCK'
    default: "MOCK"
  },
  providerMessageId: String,
  status: {
    type: String,
    enum: ["PENDING", "SENT", "DELIVERED", "FAILED"],
    default: "PENDING",
    index: true
  },
  sentAt: Date,
  deliveredAt: Date,
  errorMessage: String,
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true,
    index: true
  },
  templateName: String,
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification"
  }
}, { timestamps: true });

module.exports = mongoose.model("SmsLog", smsLogSchema);
