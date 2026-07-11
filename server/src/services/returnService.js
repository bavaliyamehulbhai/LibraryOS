const Transaction = require("../models/Transaction");
const BookCopy = require("../models/BookCopy");
const Book = require("../models/Book");
const Member = require("../models/Member");
const MembershipPlan = require("../models/MembershipPlan");
const Fine = require("../models/Fine");
const auditService = require("./auditService");
const borrowHistoryService = require("./borrowHistoryService");
const notificationService = require("./notificationService");

exports.returnBook = async (libraryId, copyBarcode, condition, returnedByUserId) => {
  // 1. Find Copy by Barcode
  const copy = await BookCopy.findOne({ barcode: copyBarcode, libraryId }).populate('bookId');
  if (!copy) throw new Error("Book copy not found for this barcode.");

  // 2. Find Active Issue
  const transaction = await Transaction.findOne({
    copyId: copy._id, // wait, our model has `bookCopyId`
    bookCopyId: copy._id,
    libraryId,
    status: { $in: ["ISSUED", "OVERDUE", "RENEWED"] }
  }).populate("memberId");

  if (!transaction) {
    throw new Error("No active issue found for this book copy.");
  }

  const member = transaction.memberId;

  // 3. Due Date & Fine Calculation
  const returnDate = new Date();
  const dueDate = new Date(transaction.dueDate);
  
  let lateDays = 0;
  let fineAmount = 0;
  let fineType = "LATE_RETURN";
  let reason = "Late Return Fine";

  if (returnDate > dueDate) {
    const timeDiff = returnDate.getTime() - dueDate.getTime();
    lateDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // Get Membership Plan Fine Rule
  const plan = await MembershipPlan.findOne({ _id: member.membershipPlanId, libraryId });
  const finePerDay = plan ? plan.finePerDay : 0;

  // GRACE PERIOD Check (3 Days)
  if (lateDays > 0 && lateDays <= 3) {
    // Within grace period. We set lateDays but waive the fine amount.
    fineAmount = 0;
  } else if (lateDays > 3) {
    // Exceeded grace period. Charge for ALL late days (standard policy).
    fineAmount = lateDays * finePerDay;
  }

  // 4. Lost/Damaged Penalties
  let finalCondition = condition || "GOOD";
  if (finalCondition === "LOST") {
    fineType = "LOST_BOOK";
    reason = "Lost Book Penalty";
    const bookPrice = copy.bookId.price || 500;
    fineAmount += bookPrice + 100;
  } else if (finalCondition === "DAMAGED") {
    fineType = "DAMAGED_BOOK";
    reason = "Damaged Book Penalty";
    fineAmount += 200;
  }

  // 5. Generate Fine Record
  if (fineAmount > 0) {
    const { generateTransactionCode } = require("./transactionCodeService");
    const fineCode = await generateTransactionCode(libraryId, "FIN");

    await Fine.create({
      fineCode,
      memberId: member._id,
      transactionId: transaction._id,
      fineType,
      libraryId,
      amount: fineAmount,
      pendingAmount: fineAmount,
      reason,
      status: "PENDING"
    });
  }

  // 6. Update Transaction
  transaction.status = "RETURNED";
  transaction.returnDate = returnDate;
  transaction.lateDays = lateDays;
  transaction.fineAmount = fineAmount;
  transaction.returnCondition = finalCondition;
  transaction.returnedBy = returnedByUserId;
  await transaction.save();

  // 7. Update Copy
  copy.status = finalCondition === "LOST" ? "LOST" : finalCondition === "DAMAGED" ? "DAMAGED" : "AVAILABLE";
  await copy.save();

  // 8. Update Inventory (Only restore if not lost)
  if (finalCondition !== "LOST") {
    await Book.findByIdAndUpdate(copy.bookId._id, {
      $inc: { availableCopies: 1 }
    });

    // AUTO-ALLOCATE TO RESERVATION
    // Check if anyone is waiting for this book
    const reservationService = require("./reservationService");
    await reservationService.allocateBook(libraryId, copy.bookId._id, copy._id);

  } else {
    // If lost, we reduce total copies
    await Book.findByIdAndUpdate(copy.bookId._id, {
      $inc: { totalCopies: -1 }
    });
  }

  // 9. Update Member
  member.activeCheckouts = Math.max(0, member.activeCheckouts - 1);
  await member.save();

  // 10. Audit Log
  await auditService.createActivityLog({
    userId: returnedByUserId,
    action: "BOOK_RETURNED",
    module: "CIRCULATION",
    description: `Returned book '${copy.bookId.title}'. Condition: ${finalCondition}. Fine: ₹${fineAmount}`,
    libraryId
  });

  // 11. Real Notifications
  await notificationService.triggerEvent(libraryId, "BOOK_RETURNED", member._id, {
    bookName: copy.bookId.title,
    fineAmount: fineAmount.toString()
  });

  if (fineAmount > 0) {
    await notificationService.triggerEvent(libraryId, "FINE_GENERATED", member._id, {
      bookName: copy.bookId.title,
      fineAmount: fineAmount.toString()
    });
  }

  // 12. Record Borrow History
  await borrowHistoryService.createHistory({
    libraryId,
    memberId: member._id,
    bookId: copy.bookId._id,
    copyId: copy._id,
    transactionId: transaction._id,
    action: "RETURNED",
    remarks: `Returned. Condition: ${finalCondition}. Fine: ₹${fineAmount}`
  });

  return transaction;
};
