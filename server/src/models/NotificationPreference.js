const mongoose = require("mongoose");

const notificationPreferenceSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
    unique: true
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true,
    index: true
  },
  inAppEnabled: { type: Boolean, default: true },
  emailEnabled: { type: Boolean, default: true },
  smsEnabled: { type: Boolean, default: true },
  whatsappEnabled: { type: Boolean, default: false },
  pushEnabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("NotificationPreference", notificationPreferenceSchema);
