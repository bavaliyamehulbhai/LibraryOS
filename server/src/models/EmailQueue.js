const mongoose = require("mongoose");

const emailQueueSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library" },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  status: {
    type: String,
    enum: ["PENDING", "PROCESSING", "SENT", "FAILED"],
    default: "PENDING"
  },
  attempts: { type: Number, default: 0 },
  sentAt: { type: Date },
  error: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("EmailQueue", emailQueueSchema);
