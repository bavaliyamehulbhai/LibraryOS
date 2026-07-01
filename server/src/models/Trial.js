const mongoose = require("mongoose");

const trialSchema = new mongoose.Schema(
  {
    libraryId: { // Equivalent to tenantId
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    trialDays: {
      type: Number,
      required: true,
      default: 14
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CONVERTED"],
      default: "ACTIVE"
    },
    convertedAt: {
      type: Date
    },
    leadScore: {
      type: Number, // Computed dynamically, but we can store snapshots
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trial", trialSchema);
