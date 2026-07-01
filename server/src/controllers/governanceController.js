const AccessReview = require("../models/AccessReview");
const AccessRequest = require("../models/AccessRequest");
const User = require("../models/User");
const ComplianceLog = require("../models/ComplianceLog");
const ROLES = require("../constants/roles");

// Start Quarterly Access Review
const initiateAccessReview = async (req, res) => {
  try {
    const users = await User.find({ isActive: true });
    
    const reviews = users.map(u => ({
      userId: u._id,
      role: u.role,
      status: "PENDING"
    }));

    await AccessReview.insertMany(reviews);

    await ComplianceLog.create({
      action: "INITIATE_ACCESS_REVIEW",
      actorId: req.user.id,
      metadata: { usersReviewedCount: users.length }
    });

    res.json({ success: true, message: "Access review initiated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAccessReviews = async (req, res) => {
  try {
    const reviews = await AccessReview.find({ status: "PENDING" }).populate("userId", "name email role");
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveAccessReview = async (req, res) => {
  try {
    const { reviewId, action } = req.body; // action: "APPROVE" or "REVOKE"
    const review = await AccessReview.findById(reviewId);

    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    review.status = action === "APPROVE" ? "APPROVED" : "REVOKED";
    review.reviewerId = req.user.id;
    review.reviewDate = Date.now();
    await review.save();

    if (action === "REVOKE") {
      await User.findByIdAndUpdate(review.userId, { isActive: false });
    }

    await ComplianceLog.create({
      action: `ACCESS_REVIEW_${action}`,
      actorId: req.user.id,
      targetId: review.userId,
      metadata: { originalRole: review.role }
    });

    res.json({ success: true, message: `Access ${action.toLowerCase()}d successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// JIT Access Requests
const requestAccess = async (req, res) => {
  try {
    const { requestedRole, reason, hours } = req.body;
    
    if (!Object.values(ROLES).includes(requestedRole)) {
      return res.status(400).json({ success: false, message: "Invalid role requested." });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (hours || 4));

    await AccessRequest.create({
      requesterId: req.user.id,
      requestedRole,
      reason,
      expiresAt
    });

    res.json({ success: true, message: "Access request submitted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveAccessRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: "APPROVE" or "DENY"
    const request = await AccessRequest.findById(requestId);

    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    request.status = action === "APPROVE" ? "APPROVED" : "DENIED";
    request.approvedBy = req.user.id;
    await request.save();

    if (action === "APPROVE") {
      await User.findByIdAndUpdate(request.requesterId, { role: request.requestedRole });
      // In a real system, you'd want a cron job to revert this role at `expiresAt`
    }

    await ComplianceLog.create({
      action: `JIT_ACCESS_${action}`,
      actorId: req.user.id,
      targetId: request.requesterId,
      metadata: { requestedRole: request.requestedRole, expiresAt: request.expiresAt }
    });

    res.json({ success: true, message: `Access request ${action.toLowerCase()}d.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  initiateAccessReview,
  getAccessReviews,
  approveAccessReview,
  requestAccess,
  approveAccessRequest
};
