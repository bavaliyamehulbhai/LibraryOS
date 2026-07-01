const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true // Gateway ID, e.g., pay_123456
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true
    },
    libraryId: { // Tenant ID
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "CARD", "NET_BANKING", "WALLET", "RAZORPAY", "MANUAL"],
      default: "RAZORPAY"
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING"
    },
    paidAt: {
      type: Date
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed // Store raw gateway data for debugging
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentTransaction", paymentTransactionSchema);
