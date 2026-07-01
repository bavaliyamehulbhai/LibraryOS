const mongoose = require("mongoose");

const librarySettingSchema = new mongoose.Schema({
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true,
    unique: true
  },
  // Branding
  libraryName: String,
  logo: String,
  favicon: String,
  primaryColor: {
    type: String,
    default: "#2563eb"
  },
  secondaryColor: {
    type: String,
    default: "#1e293b"
  },
  // Contact
  supportEmail: String,
  supportPhone: String,
  website: String,
  // Rules
  finePerDay: {
    type: Number,
    default: 5
  },
  maxBorrowDays: {
    type: Number,
    default: 14
  },
  maxBooksPerStudent: {
    type: Number,
    default: 3
  },
  // Notifications
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  overdueReminder: {
    type: Boolean,
    default: true
  },
  dueReminder: {
    type: Boolean,
    default: true
  },
  // White Label
  customDomain: String,
  companyName: String,
  // Email Settings
  smtpHost: String,
  smtpPort: Number,
  smtpEmail: String,
  smtpPassword: String
}, { timestamps: true });

module.exports = mongoose.model("LibrarySetting", librarySettingSchema);
