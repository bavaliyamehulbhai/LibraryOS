const dashboardService = require("../services/memberDashboardService");
const reservationService = require("../services/reservationService");
const Reservation = require("../models/Reservation");
const User = require("../models/User");

const getMemberProfileId = async (req) => {
  const User = require("../models/User");
  const Member = require("../models/Member");
  const Library = require("../models/Library");

  const userId = req.user.id || req.user._id;
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Determine valid libraryId
  let libraryId = req.user.libraryId || user.libraryId;
  if (!libraryId) {
    const defaultLib = await Library.findOne();
    if (defaultLib) {
      libraryId = defaultLib._id;
    }
  }

  // 1. Check if user already has an existing member profile linked
  if (user.memberProfileId) {
    const existingMember = await Member.findById(user.memberProfileId);
    if (existingMember) {
      return { memberId: existingMember._id, libraryId: existingMember.libraryId || libraryId };
    }
  }

  // 2. Check if member exists by email
  let member = await Member.findOne({ email: user.email });
  if (!member) {
    const { generateMemberCode } = require("../services/memberCodeService");
    let memberCode = "MEM-" + Math.floor(100000 + Math.random() * 900000);
    try {
      if (libraryId) {
        memberCode = await generateMemberCode(libraryId);
      }
    } catch (e) {
      console.warn("Could not generate auto member code:", e.message);
    }

    const nameParts = (user.name || "Member User").trim().split(" ");
    const firstName = nameParts[0] || "Member";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "User";

    member = await Member.create({
      memberCode,
      firstName,
      lastName,
      email: user.email,
      phone: user.phone || "9876543210",
      memberType: user.role === "STUDENT" ? "STUDENT" : "EXTERNAL",
      libraryId: libraryId,
      status: "ACTIVE"
    });
  }

  // Ensure member has an active membership plan
  if (!member.membershipPlanId && libraryId) {
    const MembershipPlan = require("../models/MembershipPlan");
    let plan = await MembershipPlan.findOne({ libraryId, status: "ACTIVE" });
    if (!plan) {
      plan = await MembershipPlan.findOne({ libraryId });
    }
    if (!plan) {
      plan = await MembershipPlan.create({
        libraryId,
        name: "Standard Annual Membership",
        description: "Full access to library resources and circulation catalog.",
        borrowLimit: 10,
        issueDuration: 14,
        finePerDay: 5,
        planType: "STUDENT",
        status: "ACTIVE"
      });
    }

    member.membershipPlanId = plan._id;
    await member.save();
  }

  // Ensure member has a card
  if (libraryId) {
    const MemberCard = require("../models/MemberCard");
    let card = await MemberCard.findOne({ memberId: member._id });
    if (!card) {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      await MemberCard.create({
        memberId: member._id,
        libraryId,
        cardNumber: member.memberCode || "CARD-" + Date.now(),
        barcode: member.memberCode || "CARD-" + Date.now(),
        qrCode: member.memberCode || "CARD-" + Date.now(),
        issueDate: new Date(),
        expiryDate,
        status: "ACTIVE"
      });
    }
  }

  // Update user pointer
  user.memberProfileId = member._id;
  if (!user.libraryId && libraryId) {
    user.libraryId = libraryId;
  }
  await user.save();

  return { memberId: member._id, libraryId: member.libraryId || libraryId };
};

exports.getDashboard = async (req, res) => {
  try {
    const { memberId, libraryId } = await getMemberProfileId(req);
    const data = await dashboardService.getDashboard(libraryId, memberId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Member Dashboard Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getBorrowStats = async (req, res) => {
  try {
    const { memberId, libraryId } = await getMemberProfileId(req);
    const data = await dashboardService.getBorrowStats(libraryId, memberId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getFinesHistory = async (req, res) => {
  try {
    const { memberId, libraryId } = await getMemberProfileId(req);
    const data = await dashboardService.getFinesHistory(libraryId, memberId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMyReservations = async (req, res) => {
  try {
    const { memberId, libraryId } = await getMemberProfileId(req);
    const reservations = await Reservation.find({ memberId })
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
