const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      unique: true,
      required: true,
      uppercase: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FLAT"],
      required: true
    },
    discountValue: {
      type: Number,
      required: true
    },
    maxDiscount: {
      type: Number, // Applicable for PERCENTAGE
      default: 0
    },
    minPurchaseAmount: {
      type: Number,
      default: 0
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    usageLimit: {
      type: Number, // Total times this coupon can be used overall
      default: 100
    },
    usedCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "DISABLED"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
