const mongoose = require("mongoose");

const floorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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

floorSchema.index({ name: 1, libraryId: 1 }, { unique: true });

module.exports = mongoose.model("Floor", floorSchema);
