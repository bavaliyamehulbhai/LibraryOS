const mongoose = require("mongoose");

const complianceLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  complianceType: {
    type: String,
    enum: ["GDPR_REQUEST", "DATA_EXPORT", "ACCOUNT_DELETION", "CONSENT_UPDATED"],
    required: true
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library" },
  details: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("ComplianceLog", complianceLogSchema);
