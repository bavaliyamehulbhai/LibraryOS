const mongoose = require('mongoose');

const whiteLabelSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true,
    unique: true, // One branding setting per tenant
    index: true
  },
  customDomain: {
    type: String,
    sparse: true,
    unique: true
  },
  logo: String,
  favicon: String,
  primaryColor: {
    type: String,
    default: "#4F46E5" // Default Indigo
  },
  secondaryColor: {
    type: String,
    default: "#10B981" // Default Emerald
  },
  accentColor: {
    type: String,
    default: "#F59E0B" // Default Amber
  },
  fontFamily: {
    type: String,
    enum: ["Inter", "Roboto", "Poppins", "Open Sans", "Montserrat"],
    default: "Inter"
  },
  dashboardLayout: {
    type: String,
    enum: ["GRID", "COMPACT", "EXECUTIVE"],
    default: "GRID"
  },
  brandName: String,
  tagline: String,
  supportEmail: String,
  theme: {
    type: String,
    enum: ["LIGHT", "DARK", "SYSTEM", "CUSTOM"],
    default: "LIGHT"
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE"
  }
}, { timestamps: true });

module.exports = mongoose.model('WhiteLabel', whiteLabelSchema);
