const mongoose = require("mongoose");

const securityAlertSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library"
    },
    type: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    isResolved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

securityAlertSchema.index({ libraryId: 1, isResolved: 1, createdAt: -1 });

module.exports = mongoose.model("SecurityAlert", securityAlertSchema);
