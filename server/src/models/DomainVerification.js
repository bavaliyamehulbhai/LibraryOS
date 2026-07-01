const mongoose = require('mongoose');

const domainVerificationSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true,
    index: true
  },
  domain: {
    type: String,
    required: true,
    unique: true
  },
  verificationToken: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  lastChecked: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('DomainVerification', domainVerificationSchema);
