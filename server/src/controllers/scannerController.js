const isbnService = require("../services/isbnService");
const ocrService = require("../services/ocrService");
const ScanHistory = require("../models/ScanHistory");
const Book = require("../models/Book");
const BookCopy = require("../models/BookCopy");

exports.scanISBN = async (req, res) => {
  try {
    const { isbn } = req.body;
    const libraryId = req.user.libraryId;

    if (!isbnService.validateISBN(isbn)) {
      await ScanHistory.create({ libraryId, userId: req.user._id, scanType: "ISBN", extractedData: { isbn }, status: "FAILED" });
      return res.status(400).json({ success: false, message: "Invalid ISBN format" });
    }

    // 1. Duplicate Detection
    const isDuplicate = await isbnService.checkDuplicateISBN(isbn, libraryId);
    if (isDuplicate) {
      const existingBook = await Book.findOne({ isbn: isbnService.formatISBN(isbn), libraryId });
      
      // Smart Inventory Update: Create new BookCopy
      const newCopy = await BookCopy.create({
        bookId: existingBook._id,
        libraryId,
        branchId: req.user.branchId,
        status: "AVAILABLE",
        condition: "GOOD"
      });

      await Book.findByIdAndUpdate(existingBook._id, { $inc: { totalCopies: 1, availableCopies: 1 } });
      
      await ScanHistory.create({ libraryId, userId: req.user._id, scanType: "ISBN", extractedData: { isbn }, status: "DUPLICATE_FOUND" });
      return res.json({ success: true, message: "Duplicate found. Increased inventory.", data: existingBook });
    }

    // 2. Fetch Metadata (Google Books / Open Library)
    const bookMeta = await isbnService.fetchBookByISBN(isbn);
    if (!bookMeta) {
      await ScanHistory.create({ libraryId, userId: req.user._id, scanType: "ISBN", extractedData: { isbn }, status: "FAILED" });
      return res.status(404).json({ success: false, message: "Book metadata not found in external APIs" });
    }

    // 3. AI Category Detection & Correction
    const correctedMeta = await ocrService.detectCategoryAndCorrect(bookMeta);

    // 4. Create Book and Initial Copy
    const newBook = await Book.create({
      title: correctedMeta.title,
      author: correctedMeta.author,
      isbn: isbnService.formatISBN(isbn),
      publisher: correctedMeta.publisher,
      categories: [correctedMeta.category],
      description: correctedMeta.description,
      coverImage: correctedMeta.cover,
      libraryId,
      totalCopies: 1,
      availableCopies: 1
    });

    await BookCopy.create({
      bookId: newBook._id,
      libraryId,
      branchId: req.user.branchId,
      status: "AVAILABLE",
      condition: "GOOD"
    });

    await ScanHistory.create({ libraryId, userId: req.user._id, scanType: "ISBN", extractedData: correctedMeta, status: "SUCCESS" });
    
    res.json({ success: true, message: "Book successfully scanned and created.", data: newBook });

  } catch (error) {
    console.error("Scanner Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getScanHistory = async (req, res) => {
  try {
    const history = await ScanHistory.find({ libraryId: req.user.libraryId }).sort({ createdAt: -1 }).populate("userId", "firstName lastName");
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
