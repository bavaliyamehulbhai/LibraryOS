const mongoose = require("mongoose");

const readerNoteSchema = new mongoose.Schema(
  {
    libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "DigitalResource", required: true },
    pageNumber: { type: Number, required: true },
    noteText: { type: String, required: true },
    selectedText: { type: String }, // If this was a highlight
    color: { type: String, default: "yellow" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReaderNote", readerNoteSchema);
