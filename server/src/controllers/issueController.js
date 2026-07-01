const circulationService = require("../services/circulationService");

exports.issueBook = async (req, res) => {
  try {
    // Support both copyId (old) and bookCopyId (new) field names
    const { memberId, bookCopyId, copyId } = req.body;
    const resolvedCopyId = bookCopyId || copyId;
    if (!memberId || !resolvedCopyId) {
      return res.status(400).json({ success: false, message: "memberId and bookCopyId are required" });
    }
    const transaction = await circulationService.issueBook(req.user.libraryId, memberId, resolvedCopyId, req.user._id || req.user.id);
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getIssues = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.memberId) filters.memberId = req.query.memberId;
    const issues = await circulationService.getTransactions(req.user.libraryId, { ...filters, status: filters.status || "ISSUED" });
    res.status(200).json({ success: true, data: issues });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getIssueDetails = async (req, res) => {
  try {
    const transaction = await require("../models/Transaction")
      .findOne({ _id: req.params.id, libraryId: req.user.libraryId })
      .populate("memberId", "firstName lastName memberCode email phone")
      .populate("bookId", "title isbn coverImage")
      .populate("bookCopyId", "barcode condition")
      .populate("issuedBy", "name email");
    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
