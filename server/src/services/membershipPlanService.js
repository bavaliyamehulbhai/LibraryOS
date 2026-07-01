const MembershipPlan = require("../models/MembershipPlan");
const Member = require("../models/Member");

exports.createPlan = async (libraryId, planData) => {
  const existing = await MembershipPlan.findOne({ libraryId, name: planData.name });
  if (existing) {
    throw new Error(`A plan named ${planData.name} already exists`);
  }

  return await MembershipPlan.create({
    ...planData,
    libraryId
  });
};

exports.getPlans = async (libraryId) => {
  return await MembershipPlan.find({ libraryId }).sort({ createdAt: 1 });
};

exports.getPlanById = async (libraryId, id) => {
  const plan = await MembershipPlan.findOne({ _id: id, libraryId });
  if (!plan) throw new Error("Plan not found");
  
  // Get active members count on this plan
  const memberCount = await Member.countDocuments({ libraryId, membershipPlanId: id });
  
  return { ...plan.toObject(), memberCount };
};

exports.updatePlan = async (libraryId, id, updateData) => {
  const plan = await MembershipPlan.findOneAndUpdate(
    { _id: id, libraryId },
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!plan) throw new Error("Plan not found");
  return plan;
};

exports.deletePlan = async (libraryId, id) => {
  const membersUsingPlan = await Member.countDocuments({ libraryId, membershipPlanId: id });
  if (membersUsingPlan > 0) {
    throw new Error(`Cannot delete plan because ${membersUsingPlan} members are currently assigned to it`);
  }
  
  const plan = await MembershipPlan.findOneAndDelete({ _id: id, libraryId });
  if (!plan) throw new Error("Plan not found");
  return plan;
};

exports.assignPlan = async (libraryId, memberId, planId) => {
  const plan = await MembershipPlan.findOne({ _id: planId, libraryId, status: "ACTIVE" });
  if (!plan) throw new Error("Plan not found or inactive");

  const member = await Member.findOneAndUpdate(
    { _id: memberId, libraryId },
    { $set: { membershipPlanId: planId } },
    { new: true }
  );
  if (!member) throw new Error("Member not found");
  return member;
};

exports.getAnalytics = async (libraryId) => {
  const totalPlans = await MembershipPlan.countDocuments({ libraryId });
  const activePlans = await MembershipPlan.countDocuments({ libraryId, status: "ACTIVE" });
  
  return { totalPlans, activePlans };
};
