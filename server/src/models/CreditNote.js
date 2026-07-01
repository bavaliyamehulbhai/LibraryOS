const mongoose = require("mongoose");

const creditNoteSchema = new mongoose.Schema(
  {
    creditNoteNumber: {
      type: String,
      required: true,
      unique: true // e.g., CN-2026-000001
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CreditNote", creditNoteSchema);
