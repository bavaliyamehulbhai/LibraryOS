const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  floorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Floor",
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

sectionSchema.index({ name: 1, floorId: 1, libraryId: 1 }, { unique: true });

module.exports = mongoose.model("Section", sectionSchema);
