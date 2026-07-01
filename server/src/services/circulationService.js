const Transaction = require("../models/Transaction");
const Member = require("../models/Member");
const Book = require("../models/Book");
const BookCopy = require("../models/BookCopy");
const Fine = require("../models/Fine");
const MembershipPlan = require("../models/MembershipPlan");

exports.issueBook = async (libraryId, memberId, bookCopyId, issuedBy) => {
  const member = await Member.findOne({ _id: memberId, libraryId });
  if (!member) throw new Error("Member not found");

  if (member.status === "BLOCKED" || member.status === "SUSPENDED") throw new Error(`Member is currently ${member.status.toLowerCase()}`);
  if (!member.isVerified) throw new Error("Member profile is not verified");

  const plan = await MembershipPlan.findOne({ _id: member.membershipPlanId, libraryId });
  if (!plan) throw new Error("Member does not have an active membership plan");

  const { MemberCard } = require("../models/MemberCard");
  const card = await require("../models/MemberCard").findOne({ memberId, libraryId, status: "ACTIVE" });
  if (!card) {
    throw new Error("Member does not have an active ID card. Cannot issue book.");
  }

  if (member.activeCheckouts >= plan.borrowLimit) {
    throw new Error(`Borrowing limit reached. Maximum allowed: ${plan.borrowLimit}`);
  }

  const copy = await BookCopy.findOne({ _id: bookCopyId, libraryId });
  if (!copy) throw new Error("Book copy not found");
  if (copy.status !== "AVAILABLE") throw new Error(`Book copy is currently ${copy.status}`);

  // Calculate due date
  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(issueDate.getDate() + plan.issueDuration);

  // Update Copy
  copy.status = "ISSUED";
  await copy.save();

  // Create Transaction
  const transaction = await Transaction.create({
    libraryId,
    memberId,
    bookId: copy.bookId,
    bookCopyId,
    issueDate,
    dueDate,
    status: "ISSUED",
    issuedBy,
    maxRenewals: plan.renewalLimit
  });

  // Update Member stats
  member.activeCheckouts += 1;
  await member.save();

  return transaction;
};

exports.returnBook = async (libraryId, transactionId, returnedBy) => {
  const transaction = await Transaction.findOne({ _id: transactionId, libraryId, status: { $in: ["ISSUED", "RENEWED", "OVERDUE"] } }).populate('memberId');
  if (!transaction) throw new Error("Active transaction not found");

  const returnDate = new Date();
  let daysLate = 0;
  let fineAmount = 0;

  if (returnDate > transaction.dueDate) {
    const diffTime = Math.abs(returnDate - transaction.dueDate);
    daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Get Fine Rate from plan
    const member = await Member.findOne({ _id: transaction.memberId._id, libraryId });
    const plan = await MembershipPlan.findOne({ _id: member.membershipPlanId, libraryId });
    const finePerDay = plan ? plan.finePerDay : 10;
    
    fineAmount = daysLate * finePerDay;
  }

  transaction.returnDate = returnDate;
  transaction.status = "RETURNED";
  transaction.returnedBy = returnedBy;
  transaction.fineAmount = fineAmount;
  await transaction.save();

  if (fineAmount > 0) {
    await Fine.create({
      libraryId,
      transactionId: transaction._id,
      memberId: transaction.memberId._id,
      amount: fineAmount,
      daysLate
    });
    
    // Update member's total fines
    await Member.findByIdAndUpdate(transaction.memberId._id, { $inc: { totalFines: fineAmount } });
  }

  // Update Copy Status
  await BookCopy.findByIdAndUpdate(transaction.bookCopyId, { status: "AVAILABLE" });

  // Update Member Active Checkouts
  await Member.findByIdAndUpdate(transaction.memberId._id, { $inc: { activeCheckouts: -1 } });

  return transaction;
};

exports.renewBook = async (libraryId, transactionId) => {
  const transaction = await Transaction.findOne({ _id: transactionId, libraryId, status: { $in: ["ISSUED", "RENEWED", "OVERDUE"] } });
  if (!transaction) throw new Error("Active transaction not found");

  if (transaction.renewalCount >= transaction.maxRenewals) {
    throw new Error("Maximum renewal limit reached");
  }

  const member = await Member.findOne({ _id: transaction.memberId, libraryId });
  const plan = await MembershipPlan.findOne({ _id: member.membershipPlanId, libraryId });
  if (!plan) throw new Error("Membership plan not found for renewal calculation");

  const newDueDate = new Date(transaction.dueDate);
  newDueDate.setDate(newDueDate.getDate() + plan.issueDuration);

  transaction.dueDate = newDueDate;
  transaction.status = "RENEWED";
  transaction.renewalCount += 1;
  await transaction.save();

  return transaction;
};

exports.getTransactions = async (libraryId, filters = {}) => {
  return await Transaction.find({ libraryId, ...filters })
    .populate('memberId', 'firstName lastName memberCode')
    .populate('bookId', 'title isbn')
    .populate('bookCopyId', 'barcode copyNumber')
    .sort({ createdAt: -1 });
};
