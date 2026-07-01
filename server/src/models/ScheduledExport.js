const mongoose = require("mongoose");

const scheduledExportSchema = new mongoose.Schema({
  frequency: { type: String, enum: ["DAILY", "WEEKLY", "MONTHLY"], required: true },
  type: { type: String, enum: ["books", "inventory", "authors", "publishers", "categories", "analytics"], required: true },
  format: { type: String, enum: ["csv", "xlsx", "pdf"], required: true },
  recipients: [{ type: String }], // Array of email addresses
  filters: { type: mongoose.Schema.Types.Mixed },
  lastRunAt: { type: Date },
  isActive: { type: Boolean, default: true },
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

module.exports = mongoose.model("ScheduledExport", scheduledExportSchema);
