const mongoose = require("mongoose");

const bookCopySchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  },
  copyCode: {
    type: String,
    required: true,
    unique: true
  },
  barcode: String,
  qrCode: String,
  shelfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shelf"
  },
  status: {
    type: String,
    enum: ["AVAILABLE", "ISSUED", "RESERVED", "LOST", "DAMAGED", "MISSING"],
    default: "AVAILABLE"
  },
  condition: {
    type: String,
    enum: ["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"],
    default: "NEW"
  }
}, {
  timestamps: true
});

bookCopySchema.index({ bookId: 1, libraryId: 1 });
bookCopySchema.index({ copyCode: 1, libraryId: 1 }, { unique: true });
bookCopySchema.index({ status: 1 });
bookCopySchema.index({ barcode: 1 }, { sparse: true });

module.exports = mongoose.model("BookCopy", bookCopySchema);
