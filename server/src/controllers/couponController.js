const couponService = require("../services/couponService");
const Coupon = require("../models/Coupon");
const Plan = require("../models/Plan");

exports.createCoupon = async (req, res) => {
  try {
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode, planId } = req.body;
    if (!couponCode || !planId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    // Assuming we apply to MONTHLY price for basic validation
    const planPrice = plan.price;

    const coupon = await couponService.validateCoupon(couponCode, req.libraryId, planPrice);
    const discountAmount = couponService.calculateDiscount(coupon, planPrice);
    
    // Subtotal after discount but before GST
    const subtotal = Math.max(0, planPrice - discountAmount);
    const gst = subtotal * 0.18;
    const finalAmount = subtotal + gst;

    res.status(200).json({
      success: true,
      data: {
        discountAmount,
        subtotal,
        gst,
        finalAmount,
        couponCode: coupon.couponCode
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
