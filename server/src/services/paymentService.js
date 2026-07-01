const Payment = require("../models/Payment");
const Fine = require("../models/Fine");
const Member = require("../models/Member");
const auditService = require("./auditService");
const { generateTransactionCode } = require("./transactionCodeService");
const receiptService = require("./receiptService");

exports.processFinePayment = async (libraryId, memberId, fineId, amount, paymentMethod, transactionId, userId) => {
  const fine = await Fine.findOne({ _id: fineId, libraryId });
  if (!fine) throw new Error("Fine not found");
  if (fine.status === "PAID" || fine.status === "WAIVED") {
    throw new Error("This fine is already paid or waived.");
  }
  if (amount > fine.pendingAmount) {
    throw new Error(`Amount exceeds pending fine amount (₹${fine.pendingAmount}).`);
  }

  const paymentCode = await generateTransactionCode(libraryId, "PAY");

  const payment = await Payment.create({
    paymentCode,
    memberId,
    purpose: "FINE",
    referenceId: fineId,
    amount,
    paymentMethod,
    transactionId,
    status: "SUCCESS",
    receivedBy: userId,
    libraryId
  });

  // Update Fine
  fine.paidAmount += amount;
  fine.pendingAmount -= amount;
  
  if (fine.pendingAmount === 0) {
    fine.status = "PAID";
  } else {
    fine.status = "PARTIAL";
  }

  await fine.save();

  // Audit Log
  await auditService.createActivityLog({
    userId,
    action: "PAYMENT_SUCCESS",
    module: "FINANCE",
    description: `Received ₹${amount} via ${paymentMethod} for fine ${fine.fineCode}.`,
    libraryId
  });

  // Check if member needs unblocking (e.g. pending fines <= threshold)
  // For now, they are unblocked if their total fines are <= 500. This is evaluated dynamically in Issue/Renew.

  // Generate Receipt
  try {
    await receiptService.generateReceipt(payment, fine);
  } catch (err) {
    console.error("Failed to generate receipt", err);
  }

  return payment;
};

exports.refundPayment = async (libraryId, paymentId, reason, userId) => {
  const payment = await Payment.findOne({ _id: paymentId, libraryId });
  if (!payment) throw new Error("Payment not found");
  if (payment.status === "REFUNDED") throw new Error("Payment is already refunded");

  payment.status = "REFUNDED";
  await payment.save();

  if (payment.purpose === "FINE") {
    const fine = await Fine.findById(payment.referenceId);
    if (fine) {
      fine.paidAmount -= payment.amount;
      fine.pendingAmount += payment.amount;
      fine.status = fine.paidAmount > 0 ? "PARTIAL" : "PENDING";
      await fine.save();
    }
  }

  await auditService.createActivityLog({
    userId,
    action: "PAYMENT_REFUNDED",
    module: "FINANCE",
    description: `Refunded payment ${payment.paymentCode}. Reason: ${reason}`,
    libraryId
  });

  return payment;
};
