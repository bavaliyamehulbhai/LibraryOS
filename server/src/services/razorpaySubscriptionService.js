const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Plan = require("../models/Plan");
const Subscription = require("../models/Subscription");
const billingService = require("./billingService");
const Organization = require("../models/Organization");

const fs = require('fs');
exports.createSubscription = async (libraryId, planId, couponCode = null) => {
  try {
    fs.appendFileSync('./logs/debug.log', `rzpService.createSubscription: libraryId=${libraryId}, planId=${planId}\n`);
    const plan = await Plan.findById(planId);
    fs.appendFileSync('./logs/debug.log', `plan found: ${!!plan}\n`);
    if (!plan) throw new Error("Plan not found");

  if (!razorpay) {
    // Mock mode
    return {
      subscriptionId: "sub_mock_" + Date.now(),
      planId: plan._id,
      razorpayPlanId: plan.razorpayPlanId || "mock_plan_id"
    };
  }

  if (!plan.razorpayPlanId) throw new Error("Razorpay mapping missing for this plan");

  let subscriptionModel = await Subscription.findOne({ libraryId });
  
  if (!subscriptionModel) {
    subscriptionModel = new Subscription({ libraryId, planId });
  } else {
    subscriptionModel.planId = planId;
  }
  
  let customerId = subscriptionModel.razorpayCustomerId;

  // 1. Create customer if not exists
  if (!customerId) {
    const org = await Organization.findOne({ tenantId: libraryId });
    let customer;
    const initialEmail = org?.contactEmail || `admin_${Date.now()}@example.com`;
    try {
      customer = await razorpay.customers.create({
        name: org?.libraryName || "LibraryOS Customer",
        email: initialEmail,
        notes: { libraryId: libraryId ? String(libraryId) : "unknown" }
      });
    } catch (err) {
      if (err.statusCode === 400 && err.error?.description?.includes("already exists")) {
        customer = await razorpay.customers.create({
          name: org?.libraryName || "LibraryOS Customer",
          email: `user_${Date.now()}@libraryos.com`,
          notes: { libraryId: libraryId ? String(libraryId) : "unknown" }
        });
      } else {
        throw err;
      }
    }
    customerId = customer.id;
    subscriptionModel.razorpayCustomerId = customerId;
    // We do NOT save pendingCoupon here yet, just setup customer
    await subscriptionModel.save();
  }

  // 2. Create Razorpay Order (One-Time Payment instead of Recurring to bypass Test Account limits)
  let rzpOrder;
  try {
    if (plan.price > 0) {
      rzpOrder = await razorpay.orders.create({
        amount: Math.round(plan.price * 100),
        currency: "INR",
        receipt: "receipt_" + subscriptionModel._id.toString()
      });
    } else {
      // Free plan - just mock it
      subscriptionModel.status = "ACTIVE";
      subscriptionModel.startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (plan.billingCycle === "YEARLY" ? 12 : 1));
      subscriptionModel.endDate = endDate;
      await subscriptionModel.save();

      return {
        subscriptionId: "sub_mock_" + Date.now(),
        planId: plan._id,
        planName: plan.planName || plan.name,
        mockBypass: true
      };
    }
  } catch (apiError) {
    console.error("Failed to create Order for Subscription", apiError);
    const rawError = apiError.error?.description || apiError.message || JSON.stringify(apiError);
    throw new Error(`Razorpay Integration Error: ${rawError}`);
  }

  // 3. Temporarily save the coupon code to apply when webhook fires
  if (couponCode) {
    subscriptionModel.pendingCoupon = couponCode;
    await subscriptionModel.save();
  }

    fs.appendFileSync('./logs/debug.log', `rzpService.createSubscription: success\n`);
    return {
      subscriptionId: rzpOrder.id, // Reusing subscriptionId field for order.id
      planId: plan._id,
      planName: plan.planName || plan.name,
      razorpayPlanId: plan.razorpayPlanId
    };
  } catch (err) {
    const errorDetails = {
      message: err.message,
      stack: err.stack,
      raw: err,
      razorpayError: err.error
    };
    fs.appendFileSync('./logs/debug.log', `ERROR inside rzpService: ${JSON.stringify(errorDetails)}\n`);
    throw err;
  }
};

exports.cancelSubscription = async (libraryId) => {
  const subscription = await Subscription.findOne({ libraryId });
  if (!subscription || !subscription.razorpaySubscriptionId) {
    throw new Error("No active Razorpay subscription found");
  }

  await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId);
  
  subscription.status = "CANCELED";
  subscription.autoRenew = false;
  await subscription.save();

  return subscription;
};

exports.verifyPayment = (razorpay_payment_id, razorpay_order_id, razorpay_signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return true; // Mock mode fallback

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  return expectedSignature === razorpay_signature;
};
