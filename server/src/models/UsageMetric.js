const mongoose = require("mongoose");

const usageMetricSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    apiCalls: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    booksIssued: { type: Number, default: 0 },
    storageUsedGB: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// One record per organization per day
usageMetricSchema.index({ organizationId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("UsageMetric", usageMetricSchema);
