const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentCode: { type: String, unique: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
  
  purpose: {
    type: String,
    enum: ["FINE", "MEMBERSHIP", "DEPOSIT"],
    required: true
  },
  
  referenceId: {
    type: mongoose.Schema.Types.ObjectId, // Will point to Fine, Subscription, etc. based on purpose
    required: true,
    index: true
  },

  amount: { type: Number, required: true },
  
  paymentMethod: {
    type: String,
    enum: ["CASH", "UPI", "CARD", "RAZORPAY", "BANK_TRANSFER"],
    required: true
  },
  
  transactionId: { type: String }, // For external reference numbers

  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
    default: "SUCCESS"
  },

  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
