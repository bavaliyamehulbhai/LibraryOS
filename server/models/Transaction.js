const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true, index: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: {
    type: String,
    enum: ["ISSUED", "RETURNED", "OVERDUE", "RENEWED"],
    default: "ISSUED",
    index: true
  },
  fineAmount: { type: Number, default: 0 },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  returnedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
