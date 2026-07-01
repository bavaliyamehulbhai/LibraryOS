const mongoose = require("mongoose");

const trialExtensionSchema = new mongoose.Schema(
  {
    trialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trial",
      required: true
    },
    extendedBy: {
      type: mongoose.Schema.Types.ObjectId, // User (SUPER_ADMIN)
      ref: "User",
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    daysAdded: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrialExtension", trialExtensionSchema);
