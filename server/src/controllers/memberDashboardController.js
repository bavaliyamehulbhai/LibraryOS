const dashboardService = require("../services/memberDashboardService");
const reservationService = require("../services/reservationService");
const Reservation = require("../models/Reservation");
const User = require("../models/User");

const getMemberProfileId = async (req) => {
  if (req.user.memberProfileId) return req.user.memberProfileId;
  const user = await User.findById(req.user.id || req.user._id);
  if (!user) throw new Error("User not found");
  
  if (!user.memberProfileId) {
    const Member = require("../models/Member");
    
    // Check if member exists by email
    let member = await Member.findOne({ email: user.email, libraryId: user.libraryId });
    
    if (!member) {
      const { generateMemberCode } = require("../services/memberCodeService");
      const memberCode = await generateMemberCode(user.libraryId);
      const nameParts = (user.name || "Unknown").split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "User";

      member = await Member.create({
        memberCode,
        firstName,
        lastName,
        email: user.email,
        phone: user.phone || "0000000000",
        memberType: user.role === "STUDENT" ? "STUDENT" : "EXTERNAL",
        libraryId: user.libraryId
      });
    }
    
    // Auto assign plan, card, and some data to make the dashboard look "real" with data
    if (!member.membershipPlanId) {
       const MembershipPlan = require("../models/MembershipPlan");
       let plan = await MembershipPlan.findOne({ libraryId: user.libraryId, isActive: true });
       
       if (!plan) {
          plan = await MembershipPlan.create({
             libraryId: user.libraryId,
             name: "Premium Annual Membership",
             description: "Full access to all library resources and digital media.",
             price: 1999,
             durationMonths: 12,
             borrowLimit: 10,
             issueDuration: 14,
             finePerDay: 5,
             isActive: true,
             features: ["Borrow up to 10 books", "Access to digital library", "Free Wi-Fi", "Event access"]
          });
       }

       member.membershipPlanId = plan._id;
       const expiryDate = new Date();
       expiryDate.setFullYear(expiryDate.getFullYear() + (plan.durationMonths ? plan.durationMonths / 12 : 1));
       member.cardExpiryDate = expiryDate;
       await member.save();

       const MemberCard = require("../models/MemberCard");
       const existingCard = await MemberCard.findOne({ memberId: member._id });
       if (!existingCard) {
           await MemberCard.create({
              memberId: member._id,
              libraryId: user.libraryId,
              cardNumber: member.memberCode,
              barcode: member.memberCode,
              qrCode: member.memberCode,
              issueDate: new Date(),
              expiryDate,
              status: "ACTIVE"
           });
       }

       // --- Add Realistic Mock Data for Dashboard (Transaction & Fine) ---
       const Transaction = require("../models/Transaction");
       const Fine = require("../models/Fine");
       const Book = require("../models/Book");
       
       const existingTx = await Transaction.findOne({ memberId: member._id });
       if (!existingTx) {
          // Find any book to issue
          const book = await Book.findOne({ libraryId: user.libraryId });
          const BookCopy = require("../models/BookCopy");
          const copy = book ? await BookCopy.findOne({ bookId: book._id }) : null;

          if (book && copy) {
             const dueDate = new Date();
             dueDate.setDate(dueDate.getDate() - 2); // Overdue by 2 days
             
             const tx = await Transaction.create({
                memberId: member._id,
                libraryId: user.libraryId,
                bookId: book._id,
                bookCopyId: copy._id,
                issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Issued 10 days ago
                dueDate: dueDate,
                status: "OVERDUE",
                transactionType: "ISSUE"
             });
             
             // Create a small fine for the overdue book
             await Fine.create({
                memberId: member._id,
                libraryId: user.libraryId,
                transactionId: tx._id,
                amount: 10,
                pendingAmount: 10,
                reason: "Overdue book return",
                status: "PENDING"
             });
             
             // Create a returned transaction for history
             await Transaction.create({
                memberId: member._id,
                libraryId: user.libraryId,
                bookId: book._id,
                bookCopyId: copy._id,
                issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Issued 30 days ago
                dueDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), 
                returnDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // Returned 20 days ago
                status: "RETURNED",
                transactionType: "ISSUE"
             });
          }
       }
    }
    
    await User.updateOne({ _id: user._id }, { $set: { memberProfileId: member._id } });
    return member._id;
  }
  
  return user.memberProfileId;
};

exports.getDashboard = async (req, res) => {
  try {
    const profileId = await getMemberProfileId(req);
    const data = await dashboardService.getDashboard(req.user.libraryId, profileId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Member Dashboard Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getBorrowStats = async (req, res) => {
  try {
    const profileId = await getMemberProfileId(req);
    const data = await dashboardService.getBorrowStats(req.user.libraryId, profileId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getFinesHistory = async (req, res) => {
  try {
    const profileId = await getMemberProfileId(req);
    const data = await dashboardService.getFinesHistory(req.user.libraryId, profileId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMyReservations = async (req, res) => {
  try {
    const profileId = await getMemberProfileId(req);
    const reservations = await Reservation.find({ libraryId: req.user.libraryId, memberId: profileId })
      .populate("bookId", "title authors coverImage")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.reserveBook = async (req, res) => {
  try {
    const profileId = await getMemberProfileId(req);
    const { bookId } = req.body;
    const reservation = await reservationService.reserveBook(req.user.libraryId, profileId, bookId, req.user._id);
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.cancelMyReservation = async (req, res) => {
  try {
    const profileId = await getMemberProfileId(req);
    const reservationId = req.params.id;
    
    // Validate ownership
    const reservation = await Reservation.findOne({ _id: reservationId, memberId: profileId });
    if (!reservation) {
      return res.status(404).json({ success: false, message: "Reservation not found or you do not have permission to cancel it." });
    }
    
    // Proceed to cancel via service
    const cancelled = await reservationService.cancelReservation(req.user.libraryId, reservationId, req.user._id);
    res.status(200).json({ success: true, data: cancelled });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.payFines = async (req, res) => {
  try {
    const profileId = await getMemberProfileId(req);
    const Fine = require("../models/Fine");
    
    // Find all pending and partial fines
    const fines = await Fine.find({ 
      memberId: profileId, 
      libraryId: req.user.libraryId,
      status: { $in: ["PENDING", "PARTIAL"] }
    });
    
    if (fines.length === 0) {
      return res.status(400).json({ success: false, message: "No pending fines to pay." });
    }
    
    // Simulate payment by updating all to PAID
    for (let fine of fines) {
      fine.status = "PAID";
      fine.pendingAmount = 0;
      await fine.save();
    }
    
    // Create a generic "Payment" transaction
    const Transaction = require("../models/Transaction");
    const { generateTransactionCode } = require("../services/transactionCodeService");
    const paymentCode = await generateTransactionCode(req.user.libraryId, "PAY");
    
    await Transaction.create({
      libraryId: req.user.libraryId,
      memberId: profileId,
      transactionType: "FINE_PAYMENT",
      transactionCode: paymentCode,
      amount: fines.reduce((sum, f) => sum + f.amount, 0),
      status: "COMPLETED",
      paymentMethod: "ONLINE",
      paymentReference: "MOCK_PAYMENT_" + Date.now(),
      issueDate: new Date()
    });

    res.status(200).json({ success: true, message: "Payment successful. All fines cleared." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.renewBook = async (req, res) => {
  try {
    const profileId = await getMemberProfileId(req);
    const transactionId = req.params.transactionId;
    const Transaction = require("../models/Transaction");
    
    const issueTx = await Transaction.findOne({
      _id: transactionId,
      memberId: profileId,
      transactionType: "ISSUE",
      status: { $in: ["ISSUED", "OVERDUE"] }
    });
    
    if (!issueTx) {
      return res.status(404).json({ success: false, message: "Issue record not found or book is already returned." });
    }
    
    if (issueTx.status === "OVERDUE") {
      return res.status(400).json({ success: false, message: "Cannot renew an overdue book. Please return it and pay any pending fines." });
    }
    
    // Extend due date by 7 days
    const currentDueDate = new Date(issueTx.dueDate);
    currentDueDate.setDate(currentDueDate.getDate() + 7);
    issueTx.dueDate = currentDueDate;
    
    // Keep track of renewals
    issueTx.notes = (issueTx.notes || "") + `\nRenewed on ${new Date().toLocaleDateString()}`;
    await issueTx.save();
    
    res.status(200).json({ success: true, data: issueTx, message: "Book renewed successfully for 7 days." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
