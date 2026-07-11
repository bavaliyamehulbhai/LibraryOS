const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionCode: { type: String, unique: true, sparse: true },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true, index: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  bookCopyId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookCopy', required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: {
    type: String,
    enum: ["ISSUED", "RETURNED", "OVERDUE", "RENEWED"],
    default: "ISSUED",
    index: true
  },
  renewalCount: { type: Number, default: 0 },
  maxRenewals: { type: Number, default: 1 },
  renewalHistory: [{
    renewedAt: { type: Date, default: Date.now },
    oldDueDate: Date,
    newDueDate: Date
  }],
  fineAmount: { type: Number, default: 0 },
  actualReturnDate: { type: Date },
  lateDays: { type: Number, default: 0 },
  returnCondition: {
    type: String,
    enum: ["GOOD", "DAMAGED", "LOST"]
  },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  returnedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: { type: String },
  
  // Automation Tracking
  reminderSent3DaysBefore: { type: Boolean, default: false },
  dueTodaySent: { type: Boolean, default: false },
  overdueAlertSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
