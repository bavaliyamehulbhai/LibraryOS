const Transaction = require("../models/Transaction");
const Member = require("../models/Member");
const Book = require("../models/Book");
const BookCopy = require("../models/BookCopy");
const Fine = require("../models/Fine");
const MembershipPlan = require("../models/MembershipPlan");

exports.issueBook = async (libraryId, memberId, bookCopyId, issuedBy) => {
  const member = await Member.findById(memberId);
  if (!member) throw new Error("Member not found");

  const effectiveLibraryId = member.libraryId || libraryId;

  if (member.status === "BLOCKED" || member.status === "SUSPENDED") throw new Error(`Member is currently ${member.status.toLowerCase()}`);

  const plan = await MembershipPlan.findById(member.membershipPlanId);
  if (!plan) throw new Error("Member does not have an active membership plan assigned. Please assign a plan first.");

  if (member.activeCheckouts >= plan.borrowLimit) {
    throw new Error(`Borrowing limit reached. Maximum allowed: ${plan.borrowLimit}`);
  }

  const copy = await BookCopy.findById(bookCopyId).populate('bookId');
  if (!copy) throw new Error("Book copy not found");
  if (copy.status !== "AVAILABLE") throw new Error(`Book copy is currently ${copy.status}. Only AVAILABLE copies can be issued.`);

  // Calculate due date
  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(issueDate.getDate() + (plan.issueDuration || 14));

  // Update Copy
  copy.status = "ISSUED";
  await copy.save();

  // Create Transaction
  const transaction = await Transaction.create({
    libraryId: effectiveLibraryId,
    memberId,
    bookId: copy.bookId ? copy.bookId._id : copy.bookId,
    bookCopyId,
    issueDate,
    dueDate,
    status: "ISSUED",
    issuedBy,
    maxRenewals: plan.renewalLimit || 1
  });

  // Update Book available copies
  if (copy.bookId) {
    await Book.findByIdAndUpdate(copy.bookId._id || copy.bookId, { $inc: { availableCopies: -1 } });
  }

  // Update Member stats
  member.activeCheckouts += 1;
  await member.save();

  // Track for AI Recommendations
  const UserReadingProfile = require("../models/UserReadingProfile");
  const bookDetails = await Book.findById(copy.bookId._id || copy.bookId);
  if (bookDetails) {
    await UserReadingProfile.findOneAndUpdate(
      { libraryId: effectiveLibraryId, memberId },
      {
        $addToSet: { 
          categories: { $each: bookDetails.categories || [] },
          favoriteAuthors: bookDetails.author
        },
        $inc: { totalBooksRead: 1 },
        $set: { lastUpdated: new Date() }
      },
      { upsert: true, new: true }
    );
  }

  return transaction.populate ? await Transaction.findById(transaction._id)
    .populate('memberId', 'firstName lastName memberCode')
    .populate('bookId', 'title isbn')
    .populate('bookCopyId', 'barcode') : transaction;
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
    const { generateTransactionCode } = require("./transactionCodeService");
    const fineCode = await generateTransactionCode(libraryId, "FIN").catch(() => null);
    await Fine.create({
      fineCode,
      libraryId,
      transactionId: transaction._id,
      memberId: transaction.memberId._id,
      fineType: "LATE_RETURN",
      amount: fineAmount,
      pendingAmount: fineAmount,
      reason: `Late return fine — ${daysLate} day(s) overdue`,
      status: "PENDING"
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
