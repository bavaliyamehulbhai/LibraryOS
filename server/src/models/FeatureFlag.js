const mongoose = require("mongoose");

const featureFlagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    enabled: {
      type: Boolean,
      default: false
    },
    planRequirement: {
      type: String,
      enum: ["FREE", "PRO", "ENTERPRISE", "ALL"],
      default: "ALL"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeatureFlag", featureFlagSchema);
