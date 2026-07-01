const mediaService = require("../services/mediaService");
const Book = require("../models/Book");
const AuditLog = require("../models/AuditLog");

exports.uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }
    const bookId = req.params.id;
    const imageUrl = req.file.path; // Multer-storage-cloudinary returns the URL in file.path

    const book = await Book.findOne({ _id: bookId, libraryId: req.user.libraryId });
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });

    // If a cover already exists, delete the old one
    if (book.coverImage) {
      await mediaService.deleteImage(book.coverImage);
    }

    const thumbnail = mediaService.generateThumbnail(imageUrl);
    
    book.coverImage = imageUrl;
    book.thumbnail = thumbnail;
    await book.save();

    await AuditLog.create({
      action: "COVER_UPLOADED",
      entity: "BOOK",
      entityId: book._id,
      userId: req.user._id,
      libraryId: req.user.libraryId,
      details: `Uploaded cover for ${book.title}`
    });

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.replaceCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }
    const imageUrl = req.file.path;
    const book = await mediaService.replaceCover(req.params.id, req.user.libraryId, imageUrl, req.user._id);
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.removeCover = async (req, res) => {
  try {
    const book = await mediaService.removeCover(req.params.id, req.user.libraryId, req.user._id);
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCoverStats = async (req, res) => {
  try {
    const stats = await mediaService.getCoverStats(req.user.libraryId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getGallery = async (req, res) => {
  try {
    // Pagination and filters for the gallery view
    const { page = 1, limit = 24, hasCover, search, category } = req.query;
    
    const query = { libraryId: req.user.libraryId };
    
    if (hasCover === 'true') query.coverImage = { $ne: null };
    if (hasCover === 'false') query.coverImage = null;
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: "i" };

    const books = await Book.find(query)
      .populate("author category")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    const total = await Book.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      data: books,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
