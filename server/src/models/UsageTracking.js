const mongoose = require("mongoose");

const usageTrackingSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
      unique: true // 1 Tenant = 1 Usage Record
    },
    booksUsed: {
      type: Number,
      default: 0
    },
    membersUsed: {
      type: Number,
      default: 0
    },
    branchesUsed: {
      type: Number,
      default: 1 // HQ branch counts as 1
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UsageTracking", usageTrackingSchema);
