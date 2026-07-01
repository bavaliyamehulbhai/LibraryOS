const Fine = require("../models/Fine");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");
const MembershipPlan = require("../models/MembershipPlan");
const auditService = require("./auditService");
const { generateTransactionCode } = require("./transactionCodeService");

exports.createManualFine = async (libraryId, memberId, amount, reason, userId) => {
  const member = await Member.findOne({ _id: memberId, libraryId });
  if (!member) throw new Error("Member not found");

  const fineCode = await generateTransactionCode(libraryId, "FIN");

  const fine = await Fine.create({
    fineCode,
    memberId,
    fineType: "MANUAL",
    amount,
    pendingAmount: amount,
    reason,
    libraryId,
    createdBy: userId
  });

  await auditService.createActivityLog({
    userId,
    action: "FINE_CREATED",
    module: "CIRCULATION",
    description: `Manual fine of ₹${amount} applied to ${member.memberCode}. Reason: ${reason}`,
    libraryId
  });

  return fine;
};

exports.waiveFine = async (libraryId, fineId, reason, userId) => {
  const fine = await Fine.findOne({ _id: fineId, libraryId }).populate("memberId");
  if (!fine) throw new Error("Fine not found");
  if (fine.status === "PAID" || fine.status === "WAIVED") {
    throw new Error("Cannot waive a fine that is already paid or waived.");
  }

  fine.status = "WAIVED";
  fine.pendingAmount = 0;
  fine.reason = fine.reason ? `${fine.reason} | Waived: ${reason}` : `Waived: ${reason}`;
  await fine.save();

  await auditService.createActivityLog({
    userId,
    action: "FINE_WAIVED",
    module: "CIRCULATION",
    description: `Waived fine ${fine.fineCode} for member ${fine.memberId.memberCode}. Reason: ${reason}`,
    libraryId
  });

  return fine;
};

exports.autoGenerateFinesJob = async () => {
  // Finds all ISSUED/RENEWED books where dueDate < today
  // In a real system, you'd calculate days passed and update a fine record or generate one.
  // For simplicity and avoiding duplicate daily fines, we'll wait for Phase 11 / returning to enforce.
  // But as per plan, we can just do a sweep and log them.
  const overdueTransactions = await Transaction.find({
    status: { $in: ["ISSUED", "RENEWED"] },
    dueDate: { $lt: new Date() }
  });

  for (const tx of overdueTransactions) {
    // Just marking status as OVERDUE if it isn't already
    if (tx.status !== "OVERDUE") {
      tx.status = "OVERDUE";
      await tx.save();
    }
  }
};
