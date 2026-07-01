const dueDateService = require("../services/dueDateService");
const Transaction = require("../models/Transaction");
const DueReminder = require("../models/DueReminder");

exports.getDashboard = async (req, res) => {
  try {
    const data = await dueDateService.getDueDateDashboard(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getOverdueBooks = async (req, res) => {
  try {
    const now = new Date();
    const overdue = await Transaction.find({
      libraryId: req.user.libraryId,
      status: { $in: ["ISSUED", "RENEWED", "OVERDUE"] },
      dueDate: { $lt: now }
    })
      .populate("memberId", "firstName lastName memberCode email")
      .populate("bookId", "title")
      .populate("bookCopyId", "barcode")
      .sort({ dueDate: 1 });

    const formatted = overdue.map(tx => {
      const daysOverdue = Math.ceil(
        (now.getTime() - new Date(tx.dueDate).getTime()) / (1000 * 3600 * 24)
      );
      return {
        _id: tx._id,
        transactionCode: tx.transactionCode,
        member: tx.memberId,
        book: tx.bookId,
        barcode: tx.bookCopyId?.barcode,
        dueDate: tx.dueDate,
        daysOverdue,
        status: tx.status
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getReminderHistory = async (req, res) => {
  try {
    const reminders = await DueReminder.find({ libraryId: req.user.libraryId })
      .populate("memberId", "firstName lastName memberCode")
      .populate("transactionId", "transactionCode dueDate")
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, data: reminders });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
