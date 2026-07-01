const membershipPlanService = require("../services/membershipPlanService");
const auditService = require("../services/auditService");

exports.createPlan = async (req, res) => {
  try {
    const plan = await membershipPlanService.createPlan(req.user.libraryId, req.body);
    await auditService.createActivityLog({
      userId: req.user._id,
      action: "PLAN_CREATED",
      module: "MEMBERSHIP",
      description: `Created new membership plan: ${plan.name}`,
      libraryId: req.user.libraryId
    });
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await membershipPlanService.getPlans(req.user.libraryId);
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPlanById = async (req, res) => {
  try {
    const plan = await membershipPlanService.getPlanById(req.user.libraryId, req.params.id);
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await membershipPlanService.updatePlan(req.user.libraryId, req.params.id, req.body);
    await auditService.createActivityLog({
      userId: req.user._id,
      action: "PLAN_UPDATED",
      module: "MEMBERSHIP",
      description: `Updated membership plan: ${plan.name}`,
      libraryId: req.user.libraryId
    });
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    await membershipPlanService.deletePlan(req.user.libraryId, req.params.id);
    await auditService.createActivityLog({
      userId: req.user._id,
      action: "PLAN_DELETED",
      module: "MEMBERSHIP",
      description: `Deleted a membership plan`,
      libraryId: req.user.libraryId
    });
    res.status(200).json({ success: true, message: "Plan deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.assignPlan = async (req, res) => {
  try {
    const member = await membershipPlanService.assignPlan(req.user.libraryId, req.params.memberId, req.body.planId);
    await auditService.createActivityLog({
      userId: req.user._id,
      action: "PLAN_ASSIGNED",
      module: "MEMBERSHIP",
      description: `Assigned plan to member ${member.memberCode}`,
      libraryId: req.user.libraryId
    });
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const data = await membershipPlanService.getAnalytics(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
