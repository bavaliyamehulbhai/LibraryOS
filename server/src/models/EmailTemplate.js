const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema({
  templateCode: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true,
    index: true
  }
}, { timestamps: true });

// Ensure one active template per event type per library
emailTemplateSchema.index({ libraryId: 1, eventType: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);
