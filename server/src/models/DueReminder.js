const mongoose = require('mongoose');

const dueReminderSchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true, index: true },
  reminderType: {
    type: String,
    enum: ["7_DAY_REMINDER", "3_DAY_REMINDER", "1_DAY_REMINDER", "DUE_TODAY", "OVERDUE"],
    required: true
  },
  sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index to prevent duplicate reminders
dueReminderSchema.index({ transactionId: 1, reminderType: 1 }, { unique: true });

module.exports = mongoose.model('DueReminder', dueReminderSchema);
