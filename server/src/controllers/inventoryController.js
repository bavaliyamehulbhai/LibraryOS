const inventoryService = require("../services/inventoryService");
const Inventory = require("../models/Inventory");
const InventoryMovement = require("../models/InventoryMovement");
const BookCopy = require("../models/BookCopy");

// Search copy by barcode (used by Issue Book screen)
exports.getCopyByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const copy = await BookCopy.findOne({ barcode, libraryId: req.user.libraryId })
      .populate("bookId", "title isbn coverImage price authors")
      .populate("branchId", "name");
    if (!copy) return res.status(404).json({ success: false, message: "No book copy found with this barcode" });
    res.status(200).json({ success: true, data: copy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const inventory = await Inventory.find({ libraryId }).populate("bookId", "title isbn coverImage");
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInventoryByBook = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const { bookId } = req.params;
    const inventory = await Inventory.findOne({ bookId, libraryId }).populate("bookId", "title isbn coverImage");
    if (!inventory) return res.status(404).json({ success: false, message: "Inventory not found" });
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const stats = await inventoryService.getInventoryStats(libraryId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMovementHistory = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const { bookId } = req.query;
    
    const query = { libraryId };
    if (bookId) query.bookId = bookId;

    const history = await InventoryMovement.find(query)
      .populate("bookId", "title isbn")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addStock = async (req, res) => {
  try {
    const { bookId, quantity, reason } = req.body;
    const inventory = await inventoryService.addStock(bookId, req.user.libraryId, Number(quantity), reason, req.user._id);
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.removeStock = async (req, res) => {
  try {
    const { bookId, quantity, reason } = req.body;
    const inventory = await inventoryService.removeStock(bookId, req.user.libraryId, Number(quantity), reason, req.user._id);
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.issueBook = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    const inventory = await inventoryService.issueBook(bookId, req.user.libraryId, Number(quantity), req.user._id);
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    const inventory = await inventoryService.returnBook(bookId, req.user.libraryId, Number(quantity), req.user._id);
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.reserveBook = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    const inventory = await inventoryService.reserveBook(bookId, req.user.libraryId, Number(quantity), req.user._id);
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.markDamaged = async (req, res) => {
  try {
    const { bookId, quantity = 1, reason } = req.body;
    const inventory = await inventoryService.markDamaged(bookId, req.user.libraryId, Number(quantity), reason, req.user._id);
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.markLost = async (req, res) => {
  try {
    const { bookId, quantity = 1, reason } = req.body;
    const inventory = await inventoryService.markLost(bookId, req.user.libraryId, Number(quantity), reason, req.user._id);
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
