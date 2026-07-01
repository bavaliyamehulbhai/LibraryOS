const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
  fineCode: { type: String, unique: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  fineType: {
    type: String,
    enum: ["LATE_RETURN", "LOST_BOOK", "DAMAGED_BOOK", "MANUAL"],
    required: true
  },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, required: true },
  reason: { type: String },
  status: {
    type: String,
    enum: ["PENDING", "PARTIAL", "PAID", "WAIVED"],
    default: "PENDING"
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Fine', fineSchema);
