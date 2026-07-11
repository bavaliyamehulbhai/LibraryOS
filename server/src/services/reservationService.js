const Reservation = require("../models/Reservation");
const Member = require("../models/Member");
const MembershipPlan = require("../models/MembershipPlan");
const Book = require("../models/Book");
const BookCopy = require("../models/BookCopy");
const auditService = require("./auditService");
const { generateTransactionCode } = require("./transactionCodeService");

exports.reserveBook = async (libraryId, memberId, bookId, userId) => {
  // 1. Validate Member
  const member = await Member.findOne({ _id: memberId, libraryId });
  if (!member) throw new Error("Member not found");
  if (member.status !== "ACTIVE") throw new Error(`Member is ${member.status}`);

  // 2. Prevent Duplicates
  const existingRes = await Reservation.findOne({
    memberId,
    bookId,
    libraryId,
    status: { $in: ["PENDING", "READY"] }
  });
  if (existingRes) throw new Error("Member already has an active reservation for this book");

  // 3. Check Limits
  const plan = await MembershipPlan.findOne({ _id: member.membershipPlanId, libraryId });
  const activeReservationsCount = await Reservation.countDocuments({
    memberId,
    libraryId,
    status: { $in: ["PENDING", "READY"] }
  });
  
  // By default, assuming max 3 reservations if plan doesn't specify.
  const resLimit = plan ? (plan.reservationLimit || 3) : 3;
  if (activeReservationsCount >= resLimit) {
    throw new Error(`Reservation limit reached (${resLimit})`);
  }

  // 4. Check if book has available copies.
  const book = await Book.findOne({ _id: bookId, libraryId });
  if (!book) throw new Error("Book not found");
  // Allow members to reserve available books (Hold Requests)
  // if (book.availableCopies > 0) {
  //   throw new Error("Book is currently available. Please issue directly instead of reserving.");
  // }

  // 5. Calculate Queue Position
  const lastReservation = await Reservation.findOne({ bookId, libraryId, status: "PENDING" }).sort({ queuePosition: -1 });
  const queuePosition = lastReservation ? lastReservation.queuePosition + 1 : 1;

  // 6. Create Reservation Code
  const reservationCode = await generateTransactionCode(libraryId, "RES");

  // 7. Create Reservation
  const reservation = await Reservation.create({
    reservationCode,
    memberId,
    bookId,
    queuePosition,
    libraryId,
    createdBy: userId
  });

  // 8. Audit Log
  await auditService.createActivityLog({
    userId,
    action: "RESERVATION_CREATED",
    module: "CIRCULATION",
    description: `Reserved book '${book.title}' for member ${member.memberCode}. Queue Pos: #${queuePosition}`,
    libraryId
  });

  console.log(`[MOCK EMAIL] To: ${member.email} - Reservation Confirmed for ${book.title}. Position: ${queuePosition}`);

  return reservation;
};

exports.allocateBook = async (libraryId, bookId, copyId) => {
  // Find the first person in queue
  const topReservation = await Reservation.findOne({ bookId, libraryId, status: "PENDING" }).sort({ queuePosition: 1 }).populate("memberId").populate("bookId");
  
  if (!topReservation) return false; // No one is waiting

  // Set to READY and expire in 48 hours
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 48);

  topReservation.status = "READY";
  topReservation.allocatedCopyId = copyId;
  topReservation.expiryDate = expiryDate;
  topReservation.queuePosition = 0; // Removing them from queue essentially
  await topReservation.save();

  // Mark copy as RESERVED
  await BookCopy.findByIdAndUpdate(copyId, { status: "RESERVED" });
  await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } }); // Keep it logically unavailable

  // Reorder remaining queue
  const remainingQueue = await Reservation.find({ bookId, libraryId, status: "PENDING" }).sort({ queuePosition: 1 });
  for (let i = 0; i < remainingQueue.length; i++) {
    remainingQueue[i].queuePosition = i + 1;
    await remainingQueue[i].save();
  }

  // Notify member
  console.log(`[MOCK SMS/WHATSAPP] To: ${topReservation.memberId.phone} - Book ${topReservation.bookId.title} is ready! Collect within 48h.`);

  return true;
};

exports.cancelReservation = async (libraryId, reservationId, userId) => {
  const res = await Reservation.findOne({ _id: reservationId, libraryId }).populate('bookId');
  if (!res) throw new Error("Reservation not found");
  
  if (res.status === "COLLECTED" || res.status === "EXPIRED" || res.status === "CANCELLED") {
    throw new Error("Cannot cancel a reservation that is already processed.");
  }

  const oldPosition = res.queuePosition;
  const bookId = res.bookId._id;
  const wasReady = res.status === "READY";
  const allocatedCopyId = res.allocatedCopyId;

  res.status = "CANCELLED";
  res.queuePosition = 0;
  await res.save();

  // If it was READY, we need to free the copy and potentially allocate to the next person!
  if (wasReady && allocatedCopyId) {
    await BookCopy.findByIdAndUpdate(allocatedCopyId, { status: "AVAILABLE" });
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } });
    
    // Auto-allocate to next in queue
    await this.allocateBook(libraryId, bookId, allocatedCopyId);
  } else {
    // Reorder queue for people behind them
    const affectedQueue = await Reservation.find({ bookId, libraryId, status: "PENDING", queuePosition: { $gt: oldPosition } });
    for (const waiting of affectedQueue) {
      waiting.queuePosition -= 1;
      await waiting.save();
    }
  }

  await auditService.createActivityLog({
    userId,
    action: "RESERVATION_CANCELLED",
    module: "CIRCULATION",
    description: `Cancelled reservation for '${res.bookId.title}'`,
    libraryId
  });

  return res;
};

exports.collectReservation = async (libraryId, reservationId, userId) => {
  // Normally called from IssueBook flow. But we can have a manual collect button.
  const res = await Reservation.findOne({ _id: reservationId, libraryId, status: "READY" }).populate("bookId").populate("memberId");
  if (!res) throw new Error("Reservation not found or not ready");

  res.status = "COLLECTED";
  await res.save();

  await auditService.createActivityLog({
    userId,
    action: "RESERVATION_COLLECTED",
    module: "CIRCULATION",
    description: `Collected reserved book '${res.bookId.title}'`,
    libraryId
  });

  // Note: The actual IssueTransaction is created by the issueBook flow.
  // We just mark it collected.
  return res;
};

exports.expireReservationsJob = async () => {
  // Find all READY reservations where expiryDate < now
  const now = new Date();
  const expired = await Reservation.find({ status: "READY", expiryDate: { $lt: now } });
  
  for (const res of expired) {
    res.status = "EXPIRED";
    await res.save();

    // Free the copy
    if (res.allocatedCopyId) {
      await BookCopy.findByIdAndUpdate(res.allocatedCopyId, { status: "AVAILABLE" });
      await Book.findByIdAndUpdate(res.bookId, { $inc: { availableCopies: 1 } });
      
      // Auto-allocate to next in queue
      await this.allocateBook(res.libraryId, res.bookId, res.allocatedCopyId);
    }
    
    console.log(`[SYSTEM] Reservation ${res.reservationCode} expired.`);
  }
};
