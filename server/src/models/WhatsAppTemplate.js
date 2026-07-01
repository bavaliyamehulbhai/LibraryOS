const mongoose = require("mongoose");

const whatsappTemplateSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ["TRANSACTIONAL", "MARKETING", "UTILITY"],
    default: "UTILITY"
  },
  message: {
    type: String,
    required: true
  },
  interactiveButtons: {
    type: [String],
    default: []
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
whatsappTemplateSchema.index({ libraryId: 1, eventType: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = mongoose.model("WhatsAppTemplate", whatsappTemplateSchema);
