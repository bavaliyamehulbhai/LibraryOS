/**
 * Borrowing Limits Service
 * Centralized eligibility & policy enforcement engine.
 * All services (issue, reserve, renew) should call this BEFORE processing.
 */

const Member = require("../models/Member");
const MembershipPlan = require("../models/MembershipPlan");
const Transaction = require("../models/Transaction");
const Reservation = require("../models/Reservation");
const Fine = require("../models/Fine");
const auditService = require("./auditService");

// ─────────────────────────────────────────────
// CORE ELIGIBILITY ENGINE
// ─────────────────────────────────────────────

/**
 * Full eligibility check for issuing a new book.
 * Throws a descriptive error if ANY check fails.
 */
exports.checkIssueEligibility = async (libraryId, memberId) => {
  const { member, plan } = await _getMemberAndPlan(libraryId, memberId);

  const checks = [
    () => _checkMemberActive(member),
    () => _checkMembershipNotExpired(member),
    () => _checkNoPendingFines(libraryId, memberId),
    () => _checkNoOverdueBooks(libraryId, memberId),
    () => _checkBorrowLimit(member, plan),
  ];

  for (const check of checks) {
    await check();
  }

  return { member, plan, eligible: true };
};

/**
 * Eligibility check for creating a reservation.
 */
exports.checkReservationEligibility = async (libraryId, memberId) => {
  const { member, plan } = await _getMemberAndPlan(libraryId, memberId);

  await _checkMemberActive(member);
  await _checkMembershipNotExpired(member);
  await _checkNoPendingFines(libraryId, memberId);
  await _checkReservationLimit(libraryId, memberId, plan);

  return { member, plan, eligible: true };
};

/**
 * Eligibility check for renewing a book.
 * renewalCount and maxRenewals come from the transaction itself.
 */
exports.checkRenewalEligibility = async (libraryId, memberId, transactionRenewalCount, transactionMaxRenewals) => {
  const { member } = await _getMemberAndPlan(libraryId, memberId);

  await _checkMemberActive(member);
  await _checkMembershipNotExpired(member);
  await _checkNoPendingFines(libraryId, memberId);

  if (transactionRenewalCount >= transactionMaxRenewals) {
    throw new Error(`Renewal denied. Maximum renewals (${transactionMaxRenewals}) already used.`);
  }

  return { eligible: true };
};

// ─────────────────────────────────────────────
// STATS FOR DASHBOARD
// ─────────────────────────────────────────────

exports.getBorrowingStats = async (libraryId) => {
  const plans = await MembershipPlan.find({ libraryId, status: "ACTIVE" });

  // Members near their limit (>= 80% of borrow limit used)
  const members = await Member.find({ libraryId, status: "ACTIVE" }).populate("membershipPlanId");
  const nearLimit = members.filter(m => {
    const limit = m.membershipPlanId?.borrowLimit || 5;
    return m.activeCheckouts >= Math.floor(limit * 0.8);
  });

  // Members with pending fines > 500 (borrowing blocked)
  const blockedByFine = await Fine.aggregate([
    { $match: { libraryId, status: { $in: ["PENDING", "PARTIAL"] } } },
    { $group: { _id: "$memberId", total: { $sum: "$pendingAmount" } } },
    { $match: { total: { $gt: 500 } } }
  ]);

  // Members with overdue books
  const overdueTransactions = await Transaction.find({
    libraryId,
    status: "OVERDUE"
  }).distinct("memberId");

  return {
    totalActivePlans: plans.length,
    nearLimitCount: nearLimit.length,
    blockedByFineCount: blockedByFine.length,
    overdueMembers: overdueTransactions.length,
    plans: plans.map(p => ({
      _id: p._id,
      name: p.name,
      planType: p.planType,
      borrowLimit: p.borrowLimit,
      reservationLimit: p.reservationLimit,
      renewalLimit: p.renewalLimit,
      issueDuration: p.issueDuration,
      finePerDay: p.finePerDay
    }))
  };
};

// ─────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────

const _getMemberAndPlan = async (libraryId, memberId) => {
  const member = await Member.findOne({ _id: memberId, libraryId });
  if (!member) throw new Error("Member not found");

  const plan = await MembershipPlan.findOne({ _id: member.membershipPlanId, libraryId });
  if (!plan) throw new Error("Membership plan not assigned to member");

  return { member, plan };
};

const _checkMemberActive = (member) => {
  if (member.status !== "ACTIVE") {
    throw new Error(`Member account is ${member.status}. Cannot process request.`);
  }
};

const _checkMembershipNotExpired = (member) => {
  if (member.cardExpiryDate && new Date() > new Date(member.cardExpiryDate)) {
    throw new Error("Membership has expired. Please renew your membership.");
  }
};

const _checkNoPendingFines = async (libraryId, memberId) => {
  const fines = await Fine.find({ memberId, libraryId, status: { $in: ["PENDING", "PARTIAL"] } });
  const total = fines.reduce((acc, f) => acc + f.pendingAmount, 0);
  if (total > 500) {
    throw new Error(`Outstanding fines of ₹${total} exceed the ₹500 limit. Please clear dues first.`);
  }
};

const _checkNoOverdueBooks = async (libraryId, memberId) => {
  const overdue = await Transaction.findOne({ libraryId, memberId, status: "OVERDUE" });
  if (overdue) {
    throw new Error("Borrowing blocked. Member has overdue books. Please return all overdue books first.");
  }
};

const _checkBorrowLimit = (member, plan) => {
  if (member.activeCheckouts >= plan.borrowLimit) {
    throw new Error(`Borrow limit reached. This member can hold a maximum of ${plan.borrowLimit} books (${plan.name} plan).`);
  }
};

const _checkReservationLimit = async (libraryId, memberId, plan) => {
  const activeReservations = await Reservation.countDocuments({
    libraryId,
    memberId,
    status: { $in: ["PENDING", "READY"] }
  });
  if (activeReservations >= plan.reservationLimit) {
    throw new Error(`Reservation limit reached. Maximum allowed: ${plan.reservationLimit} reservations.`);
  }
};
