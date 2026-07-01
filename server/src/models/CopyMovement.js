const mongoose = require("mongoose");

const copyMovementSchema = new mongoose.Schema({
  copyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BookCopy",
    required: true
  },
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  action: {
    type: String,
    enum: [
      "COPY_CREATED",
      "COPY_ISSUED",
      "COPY_RETURNED",
      "COPY_RESERVED",
      "COPY_DAMAGED",
      "COPY_LOST",
      "CONDITION_CHANGED",
      "SHELF_CHANGED"
    ],
    required: true
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

copyMovementSchema.index({ copyId: 1, libraryId: 1 });
copyMovementSchema.index({ bookId: 1, libraryId: 1 });
copyMovementSchema.index({ createdAt: -1 });

module.exports = mongoose.model("CopyMovement", copyMovementSchema);
