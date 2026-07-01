const mongoose = require("mongoose");

const smsTemplateSchema = new mongoose.Schema({
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
  message: {
    type: String, // Keep it short, usually < 160 characters
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
smsTemplateSchema.index({ libraryId: 1, eventType: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = mongoose.model("SmsTemplate", smsTemplateSchema);
