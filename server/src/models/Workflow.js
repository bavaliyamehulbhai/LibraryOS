const mongoose = require("mongoose");

const workflowSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library" },
  name: { type: String, required: true },
  trigger: { type: String, required: true }, // e.g. BOOK_RETURNED, STUDENT_CREATED
  action: { type: String, required: true },  // e.g. SEND_EMAIL, UPDATE_ANALYTICS
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" }
}, { timestamps: true });

module.exports = mongoose.model("Workflow", workflowSchema);
