const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true // e.g., INV-2026-000001
    },
    libraryId: { // This is our Tenant ID
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan"
    },
    amount: {
      type: Number,
      required: true
    },
    gst: {
      type: Number,
      required: true // Usually 18% of amount
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true // amount + gst
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED", "OVERDUE"],
      default: "PENDING"
    },
    dueDate: {
      type: Date,
      required: true
    },
    paidAt: {
      type: Date
    },
    billingCycle: {
      type: String,
      enum: ["MONTHLY", "YEARLY", "LIFETIME"]
    },
    pdfUrl: {
      type: String // Path or URL to the generated PDF
    },
    invoiceUrl: {
      type: String // Link to generated PDF
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
