const bookCopyService = require("../services/bookCopyService");
const BookCopy = require("../models/BookCopy");
const CopyMovement = require("../models/CopyMovement");

exports.getCopies = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const { search, status, condition } = req.query;

    const query = { libraryId };
    if (status) query.status = status;
    if (condition) query.condition = condition;

    // For search, we might populate and match, but straightforward regex on copyCode is easiest
    if (search) {
      query.$or = [
        { copyCode: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
        { qrCode: { $regex: search, $options: "i" } }
      ];
    }

    const copies = await BookCopy.find(query)
      .populate("bookId", "title isbn coverImage")
      .populate("shelfId", "name location")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: copies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCopy = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const copy = await BookCopy.findOne({ _id: req.params.id, libraryId })
      .populate("bookId", "title isbn coverImage")
      .populate("shelfId", "name location");

    if (!copy) return res.status(404).json({ success: false, message: "Copy not found" });

    res.status(200).json({ success: true, data: copy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCopyHistory = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const history = await CopyMovement.find({ copyId: req.params.id, libraryId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCopy = async (req, res) => {
  try {
    const { bookId } = req.body;
    const copy = await bookCopyService.createCopy(bookId, req.user.libraryId, req.user._id);
    res.status(201).json({ success: true, data: copy });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.bulkCreateCopies = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    const copies = await bookCopyService.bulkCreateCopies(bookId, req.user.libraryId, Number(quantity), req.user._id);
    res.status(201).json({ success: true, data: copies });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.issueCopy = async (req, res) => {
  try {
    const { copyId } = req.body;
    const copy = await bookCopyService.issueCopy(copyId, req.user.libraryId, req.user._id);
    res.status(200).json({ success: true, data: copy });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.returnCopy = async (req, res) => {
  try {
    const { copyId, remarks } = req.body;
    const copy = await bookCopyService.returnCopy(copyId, req.user.libraryId, req.user._id, remarks);
    res.status(200).json({ success: true, data: copy });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.reserveCopy = async (req, res) => {
  try {
    const { copyId } = req.body;
    const copy = await bookCopyService.reserveCopy(copyId, req.user.libraryId, req.user._id);
    res.status(200).json({ success: true, data: copy });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.markLost = async (req, res) => {
  try {
    const { copyId, remarks } = req.body;
    const copy = await bookCopyService.markLost(copyId, req.user.libraryId, req.user._id, remarks);
    res.status(200).json({ success: true, data: copy });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.markDamaged = async (req, res) => {
  try {
    const { copyId, remarks } = req.body;
    const copy = await bookCopyService.markDamaged(copyId, req.user.libraryId, req.user._id, remarks);
    res.status(200).json({ success: true, data: copy });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.assignShelf = async (req, res) => {
  try {
    const { shelfId } = req.body;
    const copy = await bookCopyService.assignShelf(req.params.id, req.user.libraryId, shelfId, req.user._id);
    res.status(200).json({ success: true, data: copy });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCondition = async (req, res) => {
  try {
    const { condition } = req.body;
    const copy = await bookCopyService.updateCondition(req.params.id, req.user.libraryId, condition, req.user._id);
    res.status(200).json({ success: true, data: copy });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
