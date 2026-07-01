const mongoose = require("mongoose");

const barcodeScanLogSchema = new mongoose.Schema({
  copyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BookCopy",
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
  },
  action: {
    type: String,
    enum: ["SCAN", "ISSUE", "RETURN", "VERIFY"],
    required: true
  }
}, { timestamps: true });

barcodeScanLogSchema.index({ copyId: 1, libraryId: 1 });
barcodeScanLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("BarcodeScanLog", barcodeScanLogSchema);
