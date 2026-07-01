const mongoose = require("mongoose");

const librarySettingsSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
      unique: true,
      index: true
    },
    language: { type: String, default: "en" },
    timezone: { type: String, default: "Asia/Kolkata" },
    currency: { type: String, default: "INR" },
    branding: {
      logo: { type: String, default: "" },
      primaryColor: { type: String, default: "#3B82F6" }, // Default blue-500
      theme: { type: String, enum: ["LIGHT", "DARK", "SYSTEM"], default: "SYSTEM" },
      libraryNameAlias: { type: String, default: "" }
    },
    features: {
      whatsappEnabled: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      customDomain: { type: String, default: "" }
    },
    billing: {
      billingEmail: { type: String },
      gstNumber: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LibrarySettings", librarySettingsSchema);
