const mongoose = require("mongoose");

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: String,
    borrowLimit: {
      type: Number,
      default: 5
    },
    issueDuration: {
      type: Number,
      default: 15
    },
    renewalLimit: {
      type: Number,
      default: 2
    },
    reservationLimit: {
      type: Number,
      default: 3
    },
    finePerDay: {
      type: Number,
      default: 5
    },
    planType: {
      type: String,
      enum: ["STUDENT", "FACULTY", "TEACHER", "GUEST", "PREMIUM"],
      default: "STUDENT"
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    },
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
membershipPlanSchema.index({ libraryId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("MembershipPlan", membershipPlanSchema);
