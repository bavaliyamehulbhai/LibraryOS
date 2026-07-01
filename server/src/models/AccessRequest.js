const mongoose = require("mongoose");
const ROLES = require("../constants/roles");

const accessRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    requestedRole: {
      type: String,
      enum: Object.values(ROLES),
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "DENIED"],
      default: "PENDING"
    },
    expiresAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccessRequest", accessRequestSchema);
