const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
    unique: true // A book should only have one global inventory record
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true
  },
  totalCopies: {
    type: Number,
    default: 0
  },
  availableCopies: {
    type: Number,
    default: 0
  },
  issuedCopies: {
    type: Number,
    default: 0
  },
  reservedCopies: {
    type: Number,
    default: 0
  },
  damagedCopies: {
    type: Number,
    default: 0
  },
  lostCopies: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

inventorySchema.index({ bookId: 1, libraryId: 1 }, { unique: true });

// Ensure consistency
inventorySchema.pre("save", function(next) {
  const sum = this.availableCopies + this.issuedCopies + this.reservedCopies + this.damagedCopies + this.lostCopies;
  if (this.totalCopies !== sum) {
    next(new Error(`Inventory inconsistency detected. Total (${this.totalCopies}) != Sum of parts (${sum})`));
  } else {
    next();
  }
});

module.exports = mongoose.model("Inventory", inventorySchema);
