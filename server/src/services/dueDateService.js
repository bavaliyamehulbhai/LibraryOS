const Transaction = require("../models/Transaction");
const DueReminder = require("../models/DueReminder");
const Fine = require("../models/Fine");
const Member = require("../models/Member");
const MembershipPlan = require("../models/MembershipPlan");
const { generateTransactionCode } = require("./transactionCodeService");
const auditService = require("./auditService");
const notificationService = require("./notificationService");


// ─────────────────────────────────────────────
// PURE CALCULATION HELPERS
// ─────────────────────────────────────────────

/**
 * Returns the due date given an issue date and duration in days.
 */
exports.generateDueDate = (issueDate, durationDays) => {
  const due = new Date(issueDate);
  due.setDate(due.getDate() + durationDays);
  return due;
};

/**
 * Returns number of days remaining until due date.
 * Negative means overdue.
 */
exports.calculateRemainingDays = (dueDate) => {
  const now = new Date();
  const diff = new Date(dueDate).getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
};

/**
 * Returns true if today is past the due date.
 */
exports.isOverdue = (dueDate) => {
  return new Date() > new Date(dueDate);
};

// ─────────────────────────────────────────────
// DASHBOARD DATA
// ─────────────────────────────────────────────

exports.getDueDateDashboard = async (libraryId) => {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const endOfTomorrow = new Date(endOfToday);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);

  const activeStatuses = { status: { $in: ["ISSUED", "RENEWED", "OVERDUE"] } };

  const [dueToday, dueTomorrow, overdue, dueThisWeek, pendingFines] = await Promise.all([
    Transaction.find({ libraryId, ...activeStatuses, dueDate: { $gte: startOfToday, $lte: endOfToday } })
      .populate("memberId", "firstName lastName memberCode")
      .populate("bookId", "title"),

    Transaction.find({ libraryId, ...activeStatuses, dueDate: { $gte: startOfTomorrow, $lte: endOfTomorrow } })
      .populate("memberId", "firstName lastName memberCode")
      .populate("bookId", "title"),

    Transaction.find({ libraryId, ...activeStatuses, dueDate: { $lt: startOfToday } })
      .populate("memberId", "firstName lastName memberCode email")
      .populate("bookId", "title")
      .sort({ dueDate: 1 }),

    Transaction.find({ libraryId, ...activeStatuses, dueDate: { $gte: startOfToday, $lte: new Date(now.getTime() + 7 * 24 * 3600 * 1000) } })
      .populate("memberId", "firstName lastName memberCode")
      .populate("bookId", "title"),

    Fine.countDocuments({ libraryId, status: { $in: ["PENDING", "PARTIAL"] } })
  ]);

  return {
    dueToday: dueToday.map(tx => _formatTransaction(tx)),
    dueTomorrow: dueTomorrow.map(tx => _formatTransaction(tx)),
    overdue: overdue.map(tx => _formatTransaction(tx)),
    dueThisWeek: dueThisWeek.map(tx => _formatTransaction(tx)),
    stats: {
      dueTodayCount: dueToday.length,
      dueTomorrowCount: dueTomorrow.length,
      overdueCount: overdue.length,
      dueThisWeekCount: dueThisWeek.length,
      pendingFinesCount: pendingFines
    }
  };
};

const _formatTransaction = (tx) => {
  const remainingDays = Math.ceil(
    (new Date(tx.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );
  return {
    _id: tx._id,
    transactionCode: tx.transactionCode,
    member: tx.memberId,
    book: tx.bookId,
    dueDate: tx.dueDate,
    remainingDays,
    daysOverdue: remainingDays < 0 ? Math.abs(remainingDays) : 0,
    status: tx.status
  };
};

// ─────────────────────────────────────────────
// NIGHTLY JOBS
// ─────────────────────────────────────────────

/**
 * Main nightly job:
 * 1. Marks overdue transactions as OVERDUE
 * 2. Auto-generates fines for overdue books (past grace period)
 * 3. Sends due date reminders at 7, 3, 1 day intervals
 */
exports.processDueDateJobs = async () => {
  console.log("[DueDateEngine] Starting nightly sweep...");

  const now = new Date();
  const GRACE_DAYS = 3;

  // Fetch all active issues
  const activeTransactions = await Transaction.find({
    status: { $in: ["ISSUED", "RENEWED", "OVERDUE"] }
  }).populate("memberId").populate("bookId");

  for (const tx of activeTransactions) {
    const remainingDays = Math.ceil(
      (new Date(tx.dueDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
    );
    const daysOverdue = remainingDays < 0 ? Math.abs(remainingDays) : 0;

    // ── 1. Mark as OVERDUE ──
    if (remainingDays < 0 && tx.status !== "OVERDUE") {
      tx.status = "OVERDUE";
      await tx.save();
    }

    // ── 2. Auto-generate daily fine (post grace period, only once per day) ──
    if (daysOverdue > GRACE_DAYS) {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const fineAlreadyToday = await Fine.findOne({
        transactionId: tx._id,
        fineType: "LATE_RETURN",
        createdAt: { $gte: today, $lt: tomorrow }
      });

      if (!fineAlreadyToday && tx.memberId) {
        const member = tx.memberId;
        const plan = await MembershipPlan.findOne({ _id: member.membershipPlanId, libraryId: tx.libraryId });
        const finePerDay = plan?.finePerDay || 5;
        const fineCode = await generateTransactionCode(tx.libraryId, "FIN");

        await Fine.create({
          fineCode,
          memberId: member._id,
          transactionId: tx._id,
          fineType: "LATE_RETURN",
          libraryId: tx.libraryId,
          amount: finePerDay,
          pendingAmount: finePerDay,
          reason: `Auto-generated daily fine (Day ${daysOverdue} overdue)`,
          status: "PENDING"
        });
      }
    }

    // ── 3. Send Due Date Reminders ──
    const reminderTypes = [];
    if (remainingDays === 7) reminderTypes.push("7_DAY_REMINDER");
    if (remainingDays === 3) reminderTypes.push("3_DAY_REMINDER");
    if (remainingDays === 1) reminderTypes.push("1_DAY_REMINDER");
    if (remainingDays === 0) reminderTypes.push("DUE_TODAY");
    if (daysOverdue === 1) reminderTypes.push("OVERDUE");

    for (const reminderType of reminderTypes) {
      try {
        await DueReminder.create({
          transactionId: tx._id,
          memberId: tx.memberId._id,
          libraryId: tx.libraryId,
          reminderType
        });
        // Real notification
        const eventType = remainingDays === 0 ? "BOOK_DUE_TODAY" : (daysOverdue > 0 ? "BOOK_OVERDUE" : "BOOK_DUE_REMINDER");
        await notificationService.triggerEvent(tx.libraryId, eventType, tx.memberId._id, {
          bookName: tx.bookId?.title,
          dueDate: tx.dueDate.toLocaleDateString(),
          daysLeft: Math.abs(remainingDays).toString()
        });
      } catch (e) {
        // Unique index violation = reminder already sent. Safe to skip.
      }
    }
  }

  console.log(`[DueDateEngine] Nightly sweep complete. Processed ${activeTransactions.length} transactions.`);
};
