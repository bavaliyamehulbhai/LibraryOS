const mongoose = require("mongoose");

const importJobSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  totalRows: { type: Number, default: 0 },
  processedRows: { type: Number, default: 0 },
  successRows: { type: Number, default: 0 },
  failedRows: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
    default: "PENDING"
  },
  createdBy: {
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

importJobSchema.index({ libraryId: 1, createdAt: -1 });

module.exports = mongoose.model("ImportJob", importJobSchema);
