const mongoose = require("mongoose");
const ROLES = require("../constants/roles");

const accessReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REVOKED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccessReview", accessReviewSchema);
