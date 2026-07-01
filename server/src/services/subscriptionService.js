const Subscription = require("../models/Subscription");
const Plan = require("../models/Plan");
const UsageTracking = require("../models/UsageTracking");
const AuditLog = require("../models/AuditLog");

exports.upgradePlan = async (libraryId, newPlanCode) => {
  const newPlan = await Plan.findOne({ planCode: newPlanCode });
  if (!newPlan) throw new Error("Target plan does not exist");

  const subscription = await Subscription.findOne({ libraryId });
  if (!subscription) throw new Error("No subscription found");

  // In a real app, billing gateway integration (Razorpay) would happen here
  // Phase 5 will handle actual payment validation

  subscription.planId = newPlan._id;
  // Restart billing cycle for 1 month
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + 1);
  subscription.expiryDate = expiry;
  
  await subscription.save();

  // Audit
  await AuditLog.create({
    tenantId: libraryId,
    action: "PLAN_UPGRADED",
    details: `Upgraded to ${newPlan.planName}`
  });

  return subscription;
};

exports.downgradePlan = async (libraryId, newPlanCode) => {
  const newPlan = await Plan.findOne({ planCode: newPlanCode });
  if (!newPlan) throw new Error("Target plan does not exist");

  const usage = await UsageTracking.findOne({ libraryId });
  
  // Validate usage fits new plan
  if (newPlan.maxBooks !== -1 && usage.booksUsed > newPlan.maxBooks) {
    throw new Error(`Please reduce book count to ${newPlan.maxBooks} before downgrading.`);
  }
  if (newPlan.maxMembers !== -1 && usage.membersUsed > newPlan.maxMembers) {
    throw new Error(`Please reduce member count to ${newPlan.maxMembers} before downgrading.`);
  }
  if (newPlan.maxBranches !== -1 && usage.branchesUsed > newPlan.maxBranches) {
    throw new Error(`Please reduce branch count to ${newPlan.maxBranches} before downgrading.`);
  }

  const subscription = await Subscription.findOne({ libraryId });
  subscription.planId = newPlan._id;
  
  await subscription.save();

  // Audit
  await AuditLog.create({
    tenantId: libraryId,
    action: "PLAN_DOWNGRADED",
    details: `Downgraded to ${newPlan.planName}`
  });

  return subscription;
};

exports.cancelPlan = async (libraryId) => {
  const subscription = await Subscription.findOne({ libraryId });
  subscription.autoRenew = false;
  subscription.status = "CANCELED";
  await subscription.save();
  return subscription;
};

// Cron job function (mocked here, can be triggered externally)
exports.processExpiries = async () => {
  const now = new Date();
  const expiredSubs = await Subscription.find({ 
    expiryDate: { $lt: now },
    status: "ACTIVE" 
  });

  for (let sub of expiredSubs) {
    sub.status = "EXPIRED";
    await sub.save();
    
    // Notification logic would go here
  }
  return expiredSubs.length;
};
