const mongoose = require("mongoose");
const bookStatus = require("../constants/bookStatus");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  isbn: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author"
  },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Publisher"
  },
  edition: {
    type: String
  },
  language: {
    type: String,
    default: "English"
  },
  publicationYear: Number,
  pages: Number,
  description: String,
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true
  },
  coverImage: {
    type: String
  },
  thumbnail: {
    type: String
  },
  status: {
    type: String,
    enum: Object.values(bookStatus),
    default: bookStatus.AVAILABLE
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add unique compound index for ISBN per library (tenant isolation)
bookSchema.index({ isbn: 1, libraryId: 1 }, { unique: true });
bookSchema.index({ title: "text", isbn: "text", description: "text" });

// Performance indexes
bookSchema.index({ title: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ category: 1 });

module.exports = mongoose.model("Book", bookSchema);
