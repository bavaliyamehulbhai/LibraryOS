const mongoose = require("mongoose");

const riskAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization"
    },
    riskScore: {
      type: Number,
      required: true
    },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true
    },
    reason: [{
      type: String
    }],
    ipAddress: String,
    deviceInfo: Object,
    location: Object
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("RiskAssessment", riskAssessmentSchema);
