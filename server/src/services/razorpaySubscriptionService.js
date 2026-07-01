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
    const customer = await razorpay.customers.create({
      name: org?.libraryName || "LibraryOS Customer",
      email: org?.contactEmail || "admin@example.com",
      notes: { libraryId: libraryId ? String(libraryId) : "unknown" }
    });
    customerId = customer.id;
    subscriptionModel.razorpayCustomerId = customerId;
    // We do NOT save pendingCoupon here yet, just setup customer
    await subscriptionModel.save();
  }

  // 2. Create Razorpay Subscription
  let rzpSubscription;
  try {
    rzpSubscription = await razorpay.subscriptions.create({
      plan_id: plan.razorpayPlanId,
      customer_notify: 1,
      total_count: plan.billingCycle === "YEARLY" ? 5 : 60, // Arbitrary future renewals
      customer_id: customerId
    });
  } catch (apiError) {
    if (apiError.error?.description?.includes('invalid') || apiError.statusCode === 400) {
      throw new Error(`Razorpay Error: The plan ID '${plan.razorpayPlanId}' is invalid or missing in your Razorpay Dashboard. Please create it first.`);
    }
    throw apiError;
  }

  // 3. Temporarily save the coupon code to apply when webhook fires
  if (couponCode) {
    subscriptionModel.pendingCoupon = couponCode;
    await subscriptionModel.save();
  }

    fs.appendFileSync('./logs/debug.log', `rzpService.createSubscription: success\n`);
    return {
      subscriptionId: rzpSubscription.id,
      planId: plan._id,
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

exports.verifyPayment = (razorpay_payment_id, razorpay_subscription_id, razorpay_signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return true; // Mock mode fallback

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(razorpay_payment_id + "|" + razorpay_subscription_id)
    .digest("hex");

  return expectedSignature === razorpay_signature;
};
