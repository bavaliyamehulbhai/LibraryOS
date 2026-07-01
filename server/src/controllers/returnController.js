const returnService = require("../services/returnService");
const returnReceiptService = require("../services/returnReceiptService");
const Transaction = require("../models/Transaction");

exports.returnBook = async (req, res) => {
  try {
    const { copyBarcode, condition } = req.body;
    const transaction = await returnService.returnBook(req.user.libraryId, copyBarcode, condition, req.user._id);
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getReturns = async (req, res) => {
  try {
    const returns = await Transaction.find({ libraryId: req.user.libraryId, status: "RETURNED" })
      .populate("memberId", "firstName lastName memberCode")
      .populate("bookId", "title authors")
      .populate("bookCopyId", "barcode")
      .sort({ actualReturnDate: -1 });
    res.status(200).json({ success: true, data: returns });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.printReceipt = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, libraryId: req.user.libraryId })
      .populate("memberId", "firstName lastName memberCode")
      .populate("bookId", "title")
      .populate("bookCopyId", "barcode");

    if (!transaction) throw new Error("Transaction not found");

    const pdfBuffer = await returnReceiptService.generateReturnReceiptPDF(transaction);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=ReturnReceipt_${transaction.transactionCode}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
