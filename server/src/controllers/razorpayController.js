const rzpService = require("../services/razorpaySubscriptionService");
const billingService = require("../services/billingService");
const Subscription = require("../models/Subscription");
const Fine = require("../models/Fine");
const Payment = require("../models/Payment");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const fs = require("fs");

exports.createFineOrder = async (req, res) => {
  try {
    const { amount, fineId } = req.body;
    if (!amount || amount <= 0) throw new Error("Invalid amount");

    if (!razorpay) {
      // Mock order for dev if Razorpay isn't configured
      return res.status(200).json({
        success: true,
        data: { id: "order_mock_" + Date.now(), amount: amount * 100, currency: "INR" },
        key: "mock_key"
      });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit must be integer
      currency: "INR",
      receipt: "receipt_" + fineId
    };

    const order = await razorpay.orders.create(options);
    if (!order) throw new Error("Failed to create order");

    res.status(200).json({
      success: true,
      data: order,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyFinePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, memberId, fineId, amount } = req.body;

    if (razorpay && process.env.RAZORPAY_KEY_SECRET) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(String(body))
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Invalid payment signature" });
      }
    }

    // Payment is valid, let's record it using paymentService
    const paymentService = require("../services/paymentService");
    const newPayment = await paymentService.processFinePayment(
      req.user.libraryId,
      memberId,
      fineId,
      amount,
      "RAZORPAY",
      razorpay_payment_id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: newPayment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.createSubscription = async (req, res) => {
  try {
    const { planId, libraryId, couponCode } = req.body;
    const targetLibraryId = libraryId || (req.user && req.user.libraryId);
    if (!targetLibraryId) throw new Error("Library ID is missing. Cannot process subscription.");

    if (!razorpay) {
      throw new Error("Razorpay is not configured properly. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
    }

    // Razorpay is configured, create the actual subscription
    const subscriptionData = await rzpService.createSubscription(targetLibraryId, planId, couponCode);

    res.status(200).json({
      success: true,
      data: subscriptionData
    });
  } catch (error) {
    const errorMsg = error.error?.description || error.message || JSON.stringify(error) || "Failed to initialize subscription";
    fs.appendFileSync('./logs/debug.log', `createSubscription ERROR: ${errorMsg}\n`);
    res.status(400).json({ success: false, message: errorMsg });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_subscription_id, razorpay_signature, planId, libraryId } = req.body;
    const targetLibraryId = libraryId || req.user.libraryId;
    if (!targetLibraryId) throw new Error("Library ID is missing.");
    
    // We switched to using Orders, so verify with order_id. Fallback to subscription_id if provided.
    const referenceId = razorpay_order_id || razorpay_subscription_id;
    const isValid = rzpService.verifyPayment(razorpay_payment_id, referenceId, razorpay_signature);
    
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Upgrade the subscription locally in the database
    const Plan = require("../models/Plan");
    const plan = await Plan.findById(planId);
    if(!plan) throw new Error("Plan not found");

    const subscriptionService = require("../services/subscriptionService");
    await subscriptionService.upgradePlan(targetLibraryId, plan.planCode);

    res.status(200).json({
      success: true,
      message: "Payment verified and subscription upgraded successfully"
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await rzpService.cancelSubscription(req.user.libraryId);
    res.status(200).json({
      success: true,
      message: "Subscription canceled successfully",
      data: subscription
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Webhook Handler for automated Razorpay events
exports.handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers["x-razorpay-signature"];
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, message: "Invalid webhook signature" });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "subscription.charged") {
      // Auto renewal successful
      const rzpSubId = payload.subscription.entity.id;
      const paymentId = payload.payment.entity.id;
      
      const sub = await Subscription.findOne({ razorpaySubscriptionId: rzpSubId });
      if (sub) {
        // Find latest pending invoice or create new one for auto-renewal
        let invoice = await require("../models/Invoice").findOne({ 
          subscriptionId: sub._id, 
          status: "PENDING" 
        });

        if (!invoice) {
          const Plan = require("../models/Plan");
          const plan = await Plan.findById(sub.planId);
          // Process Coupon if stored
          const couponCode = sub.pendingCoupon;
          let discountAmount = 0;
          if (couponCode && plan) {
            const { validateCoupon, calculateDiscount, recordCouponUsage } = require("../services/couponService");
            try {
               const coupon = await validateCoupon(couponCode, sub.libraryId, plan.price);
               discountAmount = calculateDiscount(coupon, plan.price);
               await recordCouponUsage(coupon._id, sub.libraryId, discountAmount, sub._id);
               
               // Clear the pending coupon so it doesn't apply to future renewals
               sub.pendingCoupon = null;
               await sub.save();
            } catch (err) {
               console.error("Failed to apply pending coupon during webhook:", err);
            }
          }

          invoice = await billingService.generateInvoice(
            sub.libraryId, 
            sub.planId, 
            plan ? plan.billingCycle : "MONTHLY",
            discountAmount
          );
        }

        await billingService.recordPayment(invoice._id, {
          transactionId: paymentId,
          paymentMethod: "RAZORPAY",
          status: "SUCCESS"
        });
      }
    } else if (event === "subscription.cancelled") {
      const rzpSubId = payload.subscription.entity.id;
      await Subscription.findOneAndUpdate(
        { razorpaySubscriptionId: rzpSubId },
        { status: "CANCELED", autoRenew: false }
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ success: false });
  }
};
