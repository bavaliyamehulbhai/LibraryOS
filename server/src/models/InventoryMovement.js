const mongoose = require("mongoose");

const inventoryMovementSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory",
    required: true
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: [
      "STOCK_ADDED",
      "STOCK_REMOVED",
      "BOOK_ISSUED",
      "BOOK_RETURNED",
      "BOOK_RESERVED",
      "BOOK_DAMAGED",
      "BOOK_LOST"
    ],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  reason: {
    type: String
  }
}, {
  timestamps: true
});

inventoryMovementSchema.index({ bookId: 1, libraryId: 1 });
inventoryMovementSchema.index({ type: 1 });
inventoryMovementSchema.index({ createdAt: -1 });

module.exports = mongoose.model("InventoryMovement", inventoryMovementSchema);
