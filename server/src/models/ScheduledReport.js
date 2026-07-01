const mongoose = require("mongoose");

const scheduledReportSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
  reportType: { type: String, required: true }, // e.g. REVENUE, USAGE, OVERDUE_BOOKS
  frequency: { type: String, enum: ["DAILY", "WEEKLY", "MONTHLY"], required: true },
  recipients: [{ type: String, required: true }], // array of emails
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("ScheduledReport", scheduledReportSchema);
