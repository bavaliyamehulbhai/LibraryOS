const mongoose = require("mongoose");

const shelfSchema = new mongoose.Schema(
  {
    libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    floor: { type: String, required: true },       // e.g., "Floor 1", "Basement"
    section: { type: String, required: true },     // e.g., "Technology", "Fiction"
    rack: { type: String, required: true },        // e.g., "A", "B", "Rack-1"
    shelfCode: { type: String, required: true },   // e.g., "A-12", "Top-Shelf"
    category: { type: String, required: true },    // The primary book category mapped to this shelf
    capacity: { type: Number, required: true },    // Max books it can hold
    occupiedSlots: { type: Number, default: 0 }    // Current number of books
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of a shelf code within a library
shelfSchema.index({ libraryId: 1, shelfCode: 1 }, { unique: true });

module.exports = mongoose.model("Shelf", shelfSchema);
