const Coupon = require("../models/Coupon");
const CouponUsage = require("../models/CouponUsage");

exports.createCoupon = async (data) => {
  const coupon = new Coupon(data);
  await coupon.save();
  return coupon;
};

exports.validateCoupon = async (code, libraryId, planPrice) => {
  const coupon = await Coupon.findOne({ couponCode: code.toUpperCase() });
  
  if (!coupon) throw new Error("Invalid coupon code");
  if (coupon.status !== "ACTIVE") throw new Error("Coupon is not active");
  
  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    throw new Error("Coupon expired or not yet valid");
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit reached");
  }

  if (planPrice < coupon.minPurchaseAmount) {
    throw new Error(`Minimum purchase amount of Rs. ${coupon.minPurchaseAmount} required`);
  }

  const alreadyUsed = await CouponUsage.findOne({ couponId: coupon._id, libraryId });
  if (alreadyUsed) {
    throw new Error("You have already used this coupon");
  }

  return coupon;
};

exports.calculateDiscount = (coupon, planPrice) => {
  let discount = 0;
  
  if (coupon.discountType === "FLAT") {
    discount = coupon.discountValue;
  } else if (coupon.discountType === "PERCENTAGE") {
    discount = (planPrice * coupon.discountValue) / 100;
    if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  }

  // Ensure discount doesn't exceed price
  return Math.min(discount, planPrice);
};

exports.recordCouponUsage = async (couponId, libraryId, discountApplied, subscriptionId) => {
  await CouponUsage.create({
    couponId,
    libraryId,
    subscriptionId,
    discountApplied
  });

  await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
};
