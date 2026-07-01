const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  featureCode: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    trim: true
  },
  featureName: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ["CORE", "COMMUNICATION", "ANALYTICS", "INTEGRATIONS", "BRANDING", "ENTERPRISE"],
    default: "CORE"
  },
  status: {
    type: String,
    enum: ["ACTIVE", "BETA", "EXPERIMENTAL", "DEPRECATED"],
    default: "ACTIVE"
  }
}, { timestamps: true });

module.exports = mongoose.model('Feature', featureSchema);
