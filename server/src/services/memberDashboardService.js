const Member = require("../models/Member");
const MembershipPlan = require("../models/MembershipPlan");
const Transaction = require("../models/Transaction");
const Fine = require("../models/Fine");
const MemberCard = require("../models/MemberCard");

exports.getDashboard = async (libraryId, memberProfileId) => {
  if (!memberProfileId) throw new Error("User does not have an associated member profile");

  // 1. Fetch Member Profile (safe lookup by ID)
  let member = await Member.findById(memberProfileId).populate("membershipPlanId");
  if (!member && libraryId) {
    member = await Member.findOne({ _id: memberProfileId, libraryId }).populate("membershipPlanId");
  }
  
  if (!member) throw new Error("Member profile not found");

  const effectiveLibraryId = member.libraryId || libraryId;

  // --- Auto-Seed Plan & Card if missing ---
  if (!member.membershipPlanId) {
    try {
      let plan = await MembershipPlan.findOne({ libraryId: effectiveLibraryId, status: "ACTIVE" });
      if (!plan) {
        plan = await MembershipPlan.findOne({ libraryId: effectiveLibraryId });
      }
      if (!plan) {
        plan = await MembershipPlan.create({
          libraryId: effectiveLibraryId,
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
      member = await Member.findById(memberProfileId).populate("membershipPlanId");
    } catch (seedError) {
      console.error("Failed to auto-seed plan for member:", seedError);
    }
  }

  // 2. Fetch Active Card
  let activeCard = await MemberCard.findOne({ memberId: member._id, status: "ACTIVE" });
  if (!activeCard) {
    activeCard = await MemberCard.findOne({ memberId: member._id });
  }

  if (!activeCard && effectiveLibraryId) {
    try {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      activeCard = await MemberCard.create({
        memberId: member._id,
        libraryId: effectiveLibraryId,
        cardNumber: member.memberCode || "LIB-" + Date.now(),
        barcode: member.memberCode || "LIB-" + Date.now(),
        qrCode: member.memberCode || "LIB-" + Date.now(),
        issueDate: new Date(),
        expiryDate,
        status: "ACTIVE"
      });
    } catch (e) {
      console.warn("Card creation skipped:", e.message);
    }
  }

  // 3. Fetch Issued Books
  const issuedBooks = await Transaction.find({ 
    memberId: member._id, 
    status: { $in: ["ISSUED", "RENEWED", "OVERDUE"] } 
  }).populate("bookId").populate("bookCopyId").sort({ dueDate: 1 });

  // 4. Fetch Fines
  const pendingFines = await Fine.find({
    memberId: member._id,
    status: { $in: ["PENDING", "PARTIAL", "UNPAID"] }
  });
  
  const totalPendingFine = pendingFines.reduce((acc, fine) => acc + (fine.pendingAmount || 0), 0);

  // 5. Fetch Reservations
  const Reservation = require("../models/Reservation");
  const reservations = await Reservation.find({ 
    memberId: member._id, 
    status: { $in: ["PENDING", "READY"] } 
  }).populate("bookId").sort({ createdAt: -1 });
  
  // 6. Notifications
  const notifications = [
    { id: 1, type: "INFO", message: "Welcome to your Member Dashboard!", date: new Date() }
  ];

  return {
    profile: {
      id: member._id,
      name: `${member.firstName || ''} ${member.lastName || ''}`.trim() || "Member",
      memberCode: member.memberCode || "MEM-001",
      email: member.email,
      phone: member.phone || "N/A",
      status: member.status || "ACTIVE",
      profileImage: member.profileImage
    },
    plan: member.membershipPlanId ? {
      name: member.membershipPlanId.name,
      borrowLimit: member.membershipPlanId.borrowLimit || 5,
      issueDuration: member.membershipPlanId.issueDuration || 14,
      finePerDay: member.membershipPlanId.finePerDay || 5,
      expiryDate: activeCard?.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    } : null,
    card: activeCard ? {
      cardNumber: activeCard.cardNumber,
      barcode: activeCard.barcode,
      qrCode: activeCard.qrCode,
      status: activeCard.status || "ACTIVE",
      issueDate: activeCard.issueDate,
      expiryDate: activeCard.expiryDate
    } : null,
    stats: {
      activeCheckouts: issuedBooks.length,
      pendingFine: totalPendingFine,
      reservationsCount: reservations.length
    },
    issuedBooks,
    pendingFines,
    reservations,
    notifications
  };
};

exports.getBorrowStats = async (libraryId, memberProfileId) => {
  const history = await Transaction.find({
    memberId: memberProfileId,
    status: "RETURNED"
  }).populate("bookId");

  return {
    totalBorrowed: history.length,
    history
  };
};

exports.getFinesHistory = async (libraryId, memberProfileId) => {
  return await Fine.find({
    memberId: memberProfileId
  }).populate({
    path: "transactionId",
    populate: { path: "bookId" }
  }).sort({ createdAt: -1 });
};
