const mongoose = require("mongoose");

const exportJobSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  format: { type: String, enum: ["csv", "xlsx", "pdf"], required: true },
  type: { type: String, enum: ["books", "inventory", "authors", "publishers", "categories", "analytics"], required: true },
  status: {
    type: String,
    enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
    default: "PENDING"
  },
  filters: { type: mongoose.Schema.Types.Mixed },
  filePath: { type: String }, // Local path or cloud URL once completed
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

exportJobSchema.index({ libraryId: 1, createdAt: -1 });

module.exports = mongoose.model("ExportJob", exportJobSchema);
