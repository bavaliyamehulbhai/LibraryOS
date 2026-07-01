const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema({
  emailCode: {
    type: String,
    unique: true
  },
  recipient: {
    type: String,
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true
  },
  templateName: {
    type: String
  },
  status: {
    type: String,
    enum: ["PENDING", "SENT", "FAILED", "OPENED"],
    default: "PENDING",
    index: true
  },
  sentAt: Date,
  openedAt: Date,
  errorMessage: String,
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true,
    index: true
  },
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification",
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model("EmailLog", emailLogSchema);
