const mongoose = require("mongoose");

const scheduledNotificationSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  scheduleDate: { type: Date, required: true },
  targetAudience: {
    type: String,
    enum: ["ALL_USERS", "STUDENTS", "STAFF", "OVERDUE_USERS"],
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING", "PROCESSED", "CANCELLED"],
    default: "PENDING"
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("ScheduledNotification", scheduledNotificationSchema);
