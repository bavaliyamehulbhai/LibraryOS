const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
      unique: true
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELED", "EXPIRED", "PAST_DUE"],
      default: "ACTIVE"
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date
    },
    paymentGatewayId: {
      type: String // e.g., sub_12345 (for Razorpay in Phase 5)
    },
    autoRenew: {
      type: Boolean,
      default: true
    },
    razorpaySubscriptionId: {
      type: String // populated after checkout
    },
    pendingCoupon: {
      type: String // Temporarily holds the coupon code during checkout until webhook fires
    },
    razorpayCustomerId: {
      type: String
    },
    currentPeriodStart: {
      type: Date
    },
    currentPeriodEnd: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
