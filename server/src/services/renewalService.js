const Transaction = require("../models/Transaction");
const Reservation = require("../models/Reservation");
const Member = require("../models/Member");
const MembershipPlan = require("../models/MembershipPlan");
const Fine = require("../models/Fine");
const auditService = require("./auditService");
const borrowHistoryService = require("./borrowHistoryService");
const notificationService = require("./notificationService");

exports.renewBook = async (libraryId, transactionId, userId) => {
  // 1. Validate Active Issue
  const transaction = await Transaction.findOne({ _id: transactionId, libraryId }).populate("bookId").populate("memberId");
  if (!transaction) throw new Error("Transaction not found");
  if (transaction.status !== "ISSUED" && transaction.status !== "OVERDUE" && transaction.status !== "RENEWED") {
    throw new Error(`Cannot renew a book that is ${transaction.status}`);
  }

  const member = transaction.memberId;
  const book = transaction.bookId;

  // 2. Validate Member Status
  if (member.status !== "ACTIVE") throw new Error(`Renewal denied. Member status is ${member.status}`);

  // 3. Validate Membership
  if (member.cardExpiryDate && new Date() > member.cardExpiryDate) {
    throw new Error("Renewal denied. Membership has expired.");
  }

  const plan = await MembershipPlan.findOne({ _id: member.membershipPlanId, libraryId });
  if (!plan) throw new Error("Membership plan not found");

  // 4. Check Renewal Limit
  const maxRenewals = plan.renewalLimit || transaction.maxRenewals || 1;
  if (transaction.renewalCount >= maxRenewals) {
    throw new Error(`Renewal denied. Maximum limit (${maxRenewals}) reached.`);
  }

  // 5. Reservation Conflict Check (Crucial step)
  const pendingReservation = await Reservation.findOne({
    bookId: book._id,
    libraryId,
    status: { $in: ["PENDING", "READY"] }
  });

  if (pendingReservation) {
    await auditService.createActivityLog({
      userId,
      action: "RENEWAL_DENIED",
      module: "CIRCULATION",
      description: `Renewal denied for '${book.title}'. Another member is waiting.`,
      libraryId
    });
    throw new Error("Renewal denied. Another member has reserved this book.");
  }

  // 6. Fine Validation
  const pendingFines = await Fine.find({ memberId: member._id, libraryId, status: "UNPAID" });
  const totalFine = pendingFines.reduce((acc, fine) => acc + fine.amount, 0);
  if (totalFine > 500) {
    throw new Error(`Renewal blocked. Outstanding fine (₹${totalFine}) exceeds limit.`);
  }

  // 7. Calculate New Due Date
  const currentDueDate = new Date(transaction.dueDate);
  const newDueDate = new Date(currentDueDate);
  newDueDate.setDate(newDueDate.getDate() + (plan.issueDuration || 15));

  // 8. Update Transaction
  const oldDueDate = transaction.dueDate;
  transaction.renewalCount += 1;
  transaction.dueDate = newDueDate;
  transaction.status = "RENEWED";
  transaction.renewalHistory.push({
    oldDueDate,
    newDueDate,
    renewedAt: new Date()
  });

  await transaction.save();

  // 9. Audit Log
  await auditService.createActivityLog({
    userId,
    action: "BOOK_RENEWED",
    module: "CIRCULATION",
    description: `Renewed '${book.title}' for member ${member.memberCode}. New Due Date: ${newDueDate.toLocaleDateString()}`,
    libraryId
  });

  // 10. Real Notification
  await notificationService.triggerEvent(libraryId, "BOOK_RENEWED", member._id, {
    bookName: book.title,
    dueDate: newDueDate.toLocaleDateString()
  });

  // 11. Record Borrow History
  await borrowHistoryService.createHistory({
    libraryId,
    memberId: member._id,
    bookId: book._id,
    transactionId: transaction._id,
    action: "RENEWED",
    remarks: `Renewed. New Due Date: ${newDueDate.toLocaleDateString()}`
  });

  return transaction;
};
