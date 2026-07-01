const mongoose = require("mongoose");

const securityEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library" },
  eventType: {
    type: String,
    enum: ["FAILED_LOGIN", "ACCOUNT_LOCKED", "PASSWORD_CHANGED", "2FA_ENABLED", "2FA_DISABLED", "SUSPICIOUS_ACTIVITY"],
    required: true
  },
  severity: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    default: "LOW"
  },
  ipAddress: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("SecurityEvent", securityEventSchema);
