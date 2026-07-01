const bookService = require("../services/bookService");
const inventoryService = require("../services/inventoryService");
const { createBookSchema, updateBookSchema } = require("../validators/bookValidator");
const { checkDuplicateISBN } = require("../services/isbnService");
const Book = require("../models/Book");
const AuditLog = require("../models/AuditLog");
const usageTrackingService = require("../services/usageTrackingService");

exports.createBook = async (req, res) => {
  try {
    // Phase 12 Limit Enforcement
    await usageTrackingService.checkBookLimit(req.user.libraryId);

    const { error, value } = createBookSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const libraryId = req.user.libraryId;

    // Check Duplicate ISBN
    const isDuplicate = await checkDuplicateISBN(value.isbn, libraryId);
    if (isDuplicate) {
      await AuditLog.create({
        action: "ISBN_DUPLICATE",
        entity: "BOOK",
        userId: req.user._id,
        libraryId: req.user.libraryId,
        details: `Failed to create book: Duplicate ISBN ${value.isbn}`
      });
      return res.status(400).json({ success: false, message: "ISBN Already Exists" });
    }

    const bookData = { ...value, libraryId };
    const book = await bookService.createBook(bookData);

    // Auto-create global inventory record
    await inventoryService.createInventory(book._id, libraryId);

    await AuditLog.create({
      action: "BOOK_CREATED",
      entity: "BOOK",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      details: `Book ${book.title} added with ISBN ${book.isbn}.`
    });

    res.status(201).json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const result = await bookService.getBooks(req.query, libraryId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBook = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const book = await bookService.getBookById(req.params.id, libraryId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }
    res.status(200).json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookByIsbn = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    // Just searching by regex to ignore hyphens, or use isbnService format
    const { formatISBN } = require("../services/isbnService");
    const cleanIsbn = formatISBN(req.params.isbn);

    const book = await Book.findOne({ isbn: cleanIsbn, libraryId, isActive: true })
      .populate("author category publisher");

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }
    res.status(200).json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getIsbnStats = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const totalBooks = await Book.countDocuments({ libraryId, isActive: true });
    
    // In a fully flushed out scenario, invalid ISBNs might be imported and flagged.
    // Since our validator prevents them from saving, invalid might be 0 unless we have soft-error logs.
    // We will just return dynamic stats based on DB for demonstration.
    
    // To find "invalid" in DB, we'd need to test all DB isbns, but let's assume all existing ones passed validation.
    res.status(200).json({
      success: true,
      data: {
        valid: totalBooks,
        invalid: 0,
        duplicate: 0 // Duplicates are blocked, so none exist
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { error, value } = updateBookSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const libraryId = req.user.libraryId;

    if (value.isbn) {
      const isDuplicate = await checkDuplicateISBN(value.isbn, libraryId, req.params.id);
      if (isDuplicate) {
        return res.status(400).json({ success: false, message: "ISBN Already Exists" });
      }
    }

    const book = await bookService.updateBook(req.params.id, libraryId, value);

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    await AuditLog.create({
      action: "BOOK_UPDATED",
      entity: "BOOK",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      details: `Book ${book.title} updated.`
    });

    res.status(200).json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const book = await bookService.deleteBook(req.params.id, libraryId);

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    await AuditLog.create({
      action: "BOOK_DELETED",
      entity: "BOOK",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      details: `Book ${book.title} deleted.`
    });

    res.status(200).json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
