const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    planCode: {
      type: String,
      required: true,
      unique: true // e.g. PLAN-STARTER, PLAN-PRO
    },
    planName: {
      type: String,
      required: true
    },
    razorpayPlanId: {
      type: String
    },
    description: String,
    price: {
      type: Number,
      required: true
    },
    billingCycle: {
      type: String,
      enum: ["MONTHLY", "YEARLY", "LIFETIME"],
      default: "MONTHLY"
    },
    maxBooks: {
      type: Number,
      required: true
    },
    maxMembers: {
      type: Number,
      required: true
    },
    maxBranches: {
      type: Number,
      default: 1
    },
    maxStorageMB: {
      type: Number,
      default: 1024
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DEPRECATED"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
