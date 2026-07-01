const mongoose = require('mongoose');

const borrowHistorySchema = new mongoose.Schema({
  historyCode: { type: String, unique: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', index: true },
  copyId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookCopy' },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  action: {
    type: String,
    enum: ["ISSUED", "RETURNED", "RENEWED", "RESERVED", "RESERVATION_CANCELLED", "RESERVATION_EXPIRED"],
    required: true,
    index: true
  },
  actionDate: { type: Date, default: Date.now },
  remarks: { type: String },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('BorrowHistory', borrowHistorySchema);
