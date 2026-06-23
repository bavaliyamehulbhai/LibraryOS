const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true, index: true },
  title: { type: String, required: true, index: true },
  author: { type: String, required: true, index: true },
  isbn: { type: String, index: true },
  category: { type: String },
  publisher: { type: String },
  publishedYear: { type: Number },
  language: { type: String },
  quantity: { type: Number, default: 0 },
  availableQuantity: { type: Number, default: 0 },
  shelfNumber: { type: String },
  bookCover: { type: String },
  description: { type: String },
  status: {
    type: String,
    enum: ["AVAILABLE", "OUT_OF_STOCK"],
    default: "AVAILABLE"
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
