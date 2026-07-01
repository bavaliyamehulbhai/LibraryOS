const path = require("path");

/**
 * Receipt Service
 * Generates a JSON receipt object for now.
 * To enable PDF: manually run `npm install pdfkit` in /server, then swap in the PDF logic below.
 */
exports.generateReceipt = async (payment, fine) => {
  const receipt = {
    receiptNumber: payment.paymentCode,
    paymentDate: payment.createdAt,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    purpose: payment.purpose,
    fineCode: fine?.fineCode || null,
    status: payment.status
  };
  // Receipt data is stored in the payment record for now.
  // Future: use pdfkit to render a downloadable PDF receipt.
  return receipt;
};

/**
 * Build Receipt Response
 * Call from controller to send receipt data to frontend.
 */
exports.buildReceiptData = (payment, fine, member) => {
  return {
    receiptNumber: payment.paymentCode,
    issuedTo: member ? `${member.firstName} ${member.lastName}` : "N/A",
    memberCode: member?.memberCode,
    fineCode: fine?.fineCode || "N/A",
    fineType: fine?.fineType || "N/A",
    amountPaid: payment.amount,
    paymentMethod: payment.paymentMethod,
    paymentDate: payment.createdAt,
    status: payment.status,
    transactionRef: payment.transactionId || null
  };
};
