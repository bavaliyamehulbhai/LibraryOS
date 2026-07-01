const borrowingLimitService = require("../services/borrowingLimitService");
const MembershipPlan = require("../models/MembershipPlan");

/**
 * GET /borrowing-limits/dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const stats = await borrowingLimitService.getBorrowingStats(req.user.libraryId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /borrowing-limits/check/:memberId
 * Returns current eligibility status for a member (without throwing)
 */
exports.checkMemberEligibility = async (req, res) => {
  try {
    const checks = {
      canIssue: false,
      canReserve: false,
      reason: null
    };

    try {
      await borrowingLimitService.checkIssueEligibility(req.user.libraryId, req.params.memberId);
      checks.canIssue = true;
    } catch (e) {
      checks.reason = e.message;
    }

    try {
      await borrowingLimitService.checkReservationEligibility(req.user.libraryId, req.params.memberId);
      checks.canReserve = true;
    } catch (e) {
      if (!checks.reason) checks.reason = e.message;
    }

    res.status(200).json({ success: true, data: checks });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /borrowing-limits/policies
 * Returns all active membership plans as the policy table
 */
exports.getPolicies = async (req, res) => {
  try {
    const plans = await MembershipPlan.find({ libraryId: req.user.libraryId }).sort({ planType: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PUT /borrowing-limits/policies/:planId
 * Update borrowing limits on a membership plan
 */
exports.updatePolicy = async (req, res) => {
  try {
    const { borrowLimit, reservationLimit, renewalLimit, issueDuration, finePerDay } = req.body;
    const plan = await MembershipPlan.findOneAndUpdate(
      { _id: req.params.planId, libraryId: req.user.libraryId },
      { borrowLimit, reservationLimit, renewalLimit, issueDuration, finePerDay },
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
