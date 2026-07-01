const Member = require("../models/Member");
const MembershipPlan = require("../models/MembershipPlan");
const Transaction = require("../models/Transaction");
const Fine = require("../models/Fine");
const MemberCard = require("../models/MemberCard");

exports.getDashboard = async (libraryId, memberProfileId) => {
  if (!memberProfileId) throw new Error("User does not have an associated member profile");

  // 1. Fetch Member Profile
  let member = await Member.findOne({ _id: memberProfileId, libraryId })
    .populate("membershipPlanId");
  
  if (!member) throw new Error("Member profile not found");

  // --- Auto-Seed Realistic Data if missing (For existing members like Aarav) ---
  if (!member.membershipPlanId) {
     try {
       const MembershipPlan = require("../models/MembershipPlan");
       let plan = await MembershipPlan.findOne({ libraryId, status: "ACTIVE" });
       
       if (!plan) {
          plan = await MembershipPlan.create({
             libraryId,
             name: "Premium Annual Membership",
             description: "Full access to all library resources and digital media.",
             borrowLimit: 10,
             issueDuration: 14,
             finePerDay: 5,
             planType: "PREMIUM",
             status: "ACTIVE"
          });
       }

       member.membershipPlanId = plan._id;
       const expiryDate = new Date();
       expiryDate.setFullYear(expiryDate.getFullYear() + 1);
       member.cardExpiryDate = expiryDate;
       await member.save();
       
       // Re-fetch to populate plan
       member = await Member.findOne({ _id: memberProfileId, libraryId }).populate("membershipPlanId");

       const MemberCard = require("../models/MemberCard");
       const existingCard = await MemberCard.findOne({ memberId: member._id });
       if (!existingCard) {
           await MemberCard.create({
              memberId: member._id,
              libraryId,
              cardNumber: "LIB-" + member.memberCode,
              barcode: "LIB-" + member.memberCode,
              qrCode: "LIB-" + member.memberCode,
              issueDate: new Date(),
              expiryDate,
              status: "ACTIVE"
           });
       }

       const Transaction = require("../models/Transaction");
       const Fine = require("../models/Fine");
       const Book = require("../models/Book");
       
       const existingTx = await Transaction.findOne({ memberId: member._id });
       if (!existingTx) {
          const book = await Book.findOne({ libraryId });
          if (book) {
             const dueDate = new Date();
             dueDate.setDate(dueDate.getDate() - 2);
             
             const tx = await Transaction.create({
                memberId: member._id,
                libraryId,
                bookId: book._id,
                issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                dueDate,
                status: "OVERDUE",
                transactionType: "ISSUE"
             });
             
             await Fine.create({
                memberId: member._id,
                libraryId,
                transactionId: tx._id,
                amount: 10,
                pendingAmount: 10,
                reason: "Overdue book return",
                status: "PENDING"
             });
          }
       }
     } catch (seedError) {
       console.error("Failed to auto-seed realistic data for member:", seedError);
     }
  }
  // --- End Auto-Seed ---

  // 2. Fetch Active Card
  const activeCard = await MemberCard.findOne({ memberId: memberProfileId, libraryId, status: "ACTIVE" });

  // 3. Fetch Issued Books
  const issuedBooks = await Transaction.find({ 
    memberId: memberProfileId, 
    libraryId, 
    status: { $in: ["ISSUED", "RENEWED", "OVERDUE"] } 
  }).populate("bookId").populate("bookCopyId").sort({ dueDate: 1 });

  // 4. Fetch Fines
  const pendingFines = await Fine.find({
    memberId: memberProfileId,
    libraryId,
    status: { $in: ["PENDING", "PARTIAL"] }
  });
  
  const totalPendingFine = pendingFines.reduce((acc, fine) => acc + fine.pendingAmount, 0);

  // 5. Fetch Reservations
  const Reservation = require("../models/Reservation");
  const reservations = await Reservation.find({ 
    memberId: memberProfileId, 
    libraryId,
    status: { $in: ["PENDING", "READY"] }
  }).populate("bookId").sort({ createdAt: -1 });
  
  // 6. Notifications (Placeholder for Phase 14 Notifications)
  const notifications = [
    { id: 1, type: "INFO", message: "Welcome to your new Member Dashboard!", date: new Date() }
  ];

  return {
    profile: {
      id: member._id,
      name: `${member.firstName} ${member.lastName}`,
      memberCode: member.memberCode,
      email: member.email,
      phone: member.phone,
      status: member.status,
      profileImage: member.profileImage
    },
    plan: member.membershipPlanId ? {
      name: member.membershipPlanId.name,
      borrowLimit: member.membershipPlanId.borrowLimit,
      issueDuration: member.membershipPlanId.issueDuration,
      finePerDay: member.membershipPlanId.finePerDay,
      expiryDate: member.cardExpiryDate
    } : null,
    card: activeCard ? {
      cardNumber: activeCard.cardNumber,
      barcode: activeCard.barcode,
      qrCode: activeCard.qrCode,
      status: activeCard.status,
      issueDate: activeCard.issueDate,
      expiryDate: activeCard.expiryDate
    } : null,
    stats: {
      activeCheckouts: issuedBooks.length,
      pendingFine: totalPendingFine,
      reservationsCount: reservations.length
    },
    issuedBooks,
    reservations,
    notifications
  };
};

exports.getBorrowStats = async (libraryId, memberProfileId) => {
  const history = await Transaction.find({
    memberId: memberProfileId,
    libraryId,
    status: "RETURNED"
  }).populate("bookId");

  return {
    totalBorrowed: history.length,
    history
  };
};

exports.getFinesHistory = async (libraryId, memberProfileId) => {
  return await Fine.find({
    memberId: memberProfileId,
    libraryId
  }).populate({
    path: "transactionId",
    populate: { path: "bookId" }
  }).sort({ createdAt: -1 });
};
