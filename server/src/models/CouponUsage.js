const mongoose = require("mongoose");

const couponUsageSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true
    },
    libraryId: { // Tenant
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription"
    },
    discountApplied: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// A tenant can only use a specific coupon once
couponUsageSchema.index({ couponId: 1, libraryId: 1 }, { unique: true });

module.exports = mongoose.model("CouponUsage", couponUsageSchema);
