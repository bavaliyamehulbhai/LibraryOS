const mongoose = require("mongoose");

const shelfMovementSchema = new mongoose.Schema({
  copyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BookCopy",
    required: true
  },
  fromShelfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shelf"
  },
  toShelfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shelf"
  },
  action: {
    type: String,
    enum: ["COPY_ASSIGNED", "COPY_REMOVED", "COPY_MOVED"],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true
  }
}, { timestamps: true });

shelfMovementSchema.index({ copyId: 1 });
shelfMovementSchema.index({ toShelfId: 1 });

module.exports = mongoose.model("ShelfMovement", shelfMovementSchema);
