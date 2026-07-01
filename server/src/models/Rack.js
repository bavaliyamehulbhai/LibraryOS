const mongoose = require("mongoose");

const rackSchema = new mongoose.Schema({
  rackCode: {
    type: String,
    required: true,
    trim: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true
  },
  floorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Floor",
    required: true
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

rackSchema.index({ rackCode: 1, sectionId: 1, libraryId: 1 }, { unique: true });

module.exports = mongoose.model("Rack", rackSchema);
