const mongoose = require("mongoose");

const qrScanLogSchema = new mongoose.Schema({
  copyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BookCopy",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
    // Optional because a public visitor might scan it to view book details
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true
  },
  action: {
    type: String,
    enum: ["SCAN", "VIEW", "VERIFY", "LOCATE"],
    required: true
  },
  device: {
    type: String,
    default: "Unknown"
  }
}, { timestamps: true });

qrScanLogSchema.index({ copyId: 1, libraryId: 1 });
qrScanLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("QRScanLog", qrScanLogSchema);
