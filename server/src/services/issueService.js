const Transaction = require("../models/Transaction");
const Member = require("../models/Member");
const MembershipPlan = require("../models/MembershipPlan");
const MemberCard = require("../models/MemberCard");
const Book = require("../models/Book");
const BookCopy = require("../models/BookCopy");
const Fine = require("../models/Fine");
const auditService = require("./auditService");
const { generateTransactionCode } = require("./transactionCodeService");
const borrowingLimitService = require("./borrowingLimitService");
const borrowHistoryService = require("./borrowHistoryService");
const notificationService = require("./notificationService");


const generateDueDate = (issueDate, durationInDays) => {
  const date = new Date(issueDate);
  date.setDate(date.getDate() + durationInDays);
  return date;
};

exports.issueBook = async (libraryId, memberId, copyId, issuedByUserId) => {
  // 1-5. Run centralized eligibility engine (Active, Expiry, Fine, Overdue, Limit)
  const { member, plan } = await borrowingLimitService.checkIssueEligibility(libraryId, memberId);

  // 6. Validate Member Card
  const activeCard = await MemberCard.findOne({ memberId, libraryId, status: "ACTIVE" });
  if (!activeCard) {
    throw new Error("Member does not have an active ID card. Cannot issue book.");
  }

  // 7. Validate Book Copy
  const copy = await BookCopy.findOne({ _id: copyId, libraryId }).populate('bookId');
  if (!copy) throw new Error("Book copy not found");
  if (copy.status !== "AVAILABLE") throw new Error(`Book copy is currently ${copy.status}`);

  // 7. Process Issue Transaction
  const issueDate = new Date();
  const dueDate = generateDueDate(issueDate, plan.issueDuration);
  const transactionCode = await generateTransactionCode(libraryId, "ISS");

  const transaction = await Transaction.create({
    transactionCode,
    libraryId,
    memberId,
    bookId: copy.bookId._id,
    bookCopyId: copy._id,
    issueDate,
    dueDate,
    status: "ISSUED",
    issuedBy: issuedByUserId,
    maxRenewals: plan.renewalLimit
  });

  // 8. Update Book Copy Status
  copy.status = "ISSUED";
  await copy.save();

  // 9. Update Book Inventory
  await Book.findByIdAndUpdate(copy.bookId._id, {
    $inc: { availableCopies: -1 }
  });

  // 10. Update Member Stats
  member.activeCheckouts += 1;
  await member.save();

  // 11. Create Audit Log
  await auditService.createActivityLog({
    userId: issuedByUserId,
    action: "BOOK_ISSUED",
    module: "CIRCULATION",
    description: `Issued book '${copy.bookId.title}' to member ${member.memberCode}`,
    libraryId
  });

  // 12. Trigger Real Notifications
  await notificationService.triggerEvent(libraryId, "BOOK_ISSUED", memberId, {
    bookName: copy.bookId.title,
    dueDate: dueDate.toLocaleDateString()
  });

  // 13. Record Borrow History
  await borrowHistoryService.createHistory({
    libraryId,
    memberId,
    bookId: copy.bookId._id,
    copyId: copy._id,
    transactionId: transaction._id,
    action: "ISSUED",
    remarks: `Issued. Due: ${dueDate.toLocaleDateString()}`
  });

  return transaction;
};

exports.getIssues = async (libraryId, filters = {}) => {
  return await Transaction.find({ libraryId, status: "ISSUED", ...filters })
    .populate("memberId", "firstName lastName memberCode")
    .populate("bookId", "title authors coverImage")
    .populate("bookCopyId", "barcode")
    .sort({ issueDate: -1 });
};

exports.getIssueDetails = async (libraryId, transactionId) => {
  const transaction = await Transaction.findOne({ _id: transactionId, libraryId })
    .populate("memberId", "firstName lastName memberCode email phone")
    .populate("bookId", "title authors isbn")
    .populate("bookCopyId", "barcode condition")
    .populate("issuedBy", "name email");

  if (!transaction) throw new Error("Transaction not found");
  return transaction;
};
