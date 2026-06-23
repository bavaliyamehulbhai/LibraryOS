const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true, index: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  amount: { type: Number, required: true },
  daysLate: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID"],
    default: "PENDING"
  },
  paidAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Fine', fineSchema);
