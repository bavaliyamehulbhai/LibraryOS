const mongoose = require("mongoose");

const auditRecordSchema = new mongoose.Schema({
  auditSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "AuditSession", required: true },
  bookCopyId: { type: mongoose.Schema.Types.ObjectId, ref: "BookCopy", required: true },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
  expectedShelfId: { type: mongoose.Schema.Types.ObjectId, ref: "Shelf" },
  scannedShelfId: { type: mongoose.Schema.Types.ObjectId, ref: "Shelf" }, // null if missing
  status: {
    type: String,
    enum: ["VERIFIED", "MISSING", "MISPLACED"],
    required: true
  },
  condition: {
    type: String,
    enum: ["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"],
    default: "GOOD"
  },
  scannedAt: { type: Date }
}, { timestamps: true });

auditRecordSchema.index({ auditSessionId: 1, status: 1 });
auditRecordSchema.index({ bookCopyId: 1, auditSessionId: 1 }, { unique: true });

module.exports = mongoose.model("AuditRecord", auditRecordSchema);
