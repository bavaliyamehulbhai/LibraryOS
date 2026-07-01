const circulationService = require("../services/circulationService");

exports.issueBook = async (req, res) => {
  try {
    const { memberId, bookCopyId } = req.body;
    const transaction = await circulationService.issueBook(req.user.libraryId, memberId, bookCopyId, req.user._id);
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await circulationService.returnBook(req.user.libraryId, transactionId, req.user._id);
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.renewBook = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await circulationService.renewBook(req.user.libraryId, transactionId);
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.memberId) filters.memberId = req.query.memberId;
    if (req.query.bookId) filters.bookId = req.query.bookId;

    const transactions = await circulationService.getTransactions(req.user.libraryId, filters);
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
