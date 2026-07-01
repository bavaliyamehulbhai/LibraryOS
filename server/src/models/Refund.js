const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentTransaction",
      required: true
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true
    },
    libraryId: { // Tenant
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "PROCESSED"],
      default: "PENDING"
    },
    processedAt: {
      type: Date
    },
    gatewayRefundId: {
      type: String // e.g., rfnd_12345
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Refund", refundSchema);
