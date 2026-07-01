const mongoose = require("mongoose");

const scanHistorySchema = new mongoose.Schema(
  {
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
    scanType: {
      type: String,
      enum: ["ISBN", "BARCODE", "QR", "OCR"],
      default: "ISBN"
    },
    extractedData: {
      type: mongoose.Schema.Types.Mixed
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "DUPLICATE_FOUND"],
      default: "SUCCESS"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScanHistory", scanHistorySchema);
