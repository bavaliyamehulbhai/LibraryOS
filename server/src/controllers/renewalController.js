const renewalService = require("../services/renewalService");
const Transaction = require("../models/Transaction");

exports.renewBook = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await renewalService.renewBook(req.user.libraryId, transactionId, req.user._id);
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getRenewalsHistory = async (req, res) => {
  try {
    // Return transactions that have been renewed at least once
    const renewals = await Transaction.find({ libraryId: req.user.libraryId, renewalCount: { $gt: 0 } })
      .populate("memberId", "firstName lastName memberCode")
      .populate("bookId", "title")
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: renewals });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
