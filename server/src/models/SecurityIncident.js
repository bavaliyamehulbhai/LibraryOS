const mongoose = require("mongoose");

const securityIncidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true
    },
    affectedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    status: {
      type: String,
      enum: ["OPEN", "INVESTIGATING", "RESOLVED"],
      default: "OPEN"
    },
    resolvedAt: {
      type: Date
    },
    resolutionNotes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("SecurityIncident", securityIncidentSchema);
