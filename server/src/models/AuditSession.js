const mongoose = require("mongoose");

const auditSessionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ["IN_PROGRESS", "COMPLETED"],
    default: "IN_PROGRESS"
  },
  totalExpected: { type: Number, default: 0 },
  totalScanned: { type: Number, default: 0 },
  totalMissing: { type: Number, default: 0 },
  totalMisplaced: { type: Number, default: 0 }
}, { timestamps: true });

auditSessionSchema.index({ libraryId: 1, status: 1 });

module.exports = mongoose.model("AuditSession", auditSessionSchema);
