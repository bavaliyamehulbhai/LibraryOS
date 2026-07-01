const cloudinary = require("../config/cloudinary");
const Book = require("../models/Book");
const AuditLog = require("../models/AuditLog");

/**
 * Extracts public_id from Cloudinary URL and deletes it.
 */
exports.deleteImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("cloudinary.com")) return;
  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v12345/libraryos/books/tenantId/filename.jpg
    const parts = imageUrl.split("/");
    const filenameWithExt = parts[parts.length - 1];
    const filename = filenameWithExt.split(".")[0];
    const folderPath = parts.slice(parts.indexOf("libraryos"), parts.length - 1).join("/");
    const publicId = `${folderPath}/${filename}`;
    
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary Deletion Error:", error);
  }
};

/**
 * Generates a thumbnail URL based on the original cover URL.
 */
exports.generateThumbnail = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("cloudinary.com")) return null;
  // Insert transformation parameters for a 300x450 thumbnail
  const parts = imageUrl.split("/upload/");
  return `${parts[0]}/upload/w_300,h_450,c_fill/${parts[1]}`;
};

/**
 * Replace cover for a book
 */
exports.replaceCover = async (bookId, libraryId, newImageUrl, userId) => {
  const book = await Book.findOne({ _id: bookId, libraryId });
  if (!book) throw new Error("Book not found");

  if (book.coverImage) {
    await this.deleteImage(book.coverImage);
  }

  const thumbnail = this.generateThumbnail(newImageUrl);
  
  book.coverImage = newImageUrl;
  book.thumbnail = thumbnail;
  await book.save();

  await AuditLog.create({
    action: "COVER_REPLACED",
    entity: "BOOK",
    entityId: book._id,
    userId,
    libraryId,
    details: `Replaced cover image for book: ${book.title}`
  });

  return book;
};

/**
 * Remove cover
 */
exports.removeCover = async (bookId, libraryId, userId) => {
  const book = await Book.findOne({ _id: bookId, libraryId });
  if (!book) throw new Error("Book not found");

  if (book.coverImage) {
    await this.deleteImage(book.coverImage);
  }

  book.coverImage = null;
  book.thumbnail = null;
  await book.save();

  await AuditLog.create({
    action: "COVER_REMOVED",
    entity: "BOOK",
    entityId: book._id,
    userId,
    libraryId,
    details: `Removed cover image for book: ${book.title}`
  });

  return book;
};

/**
 * Get Cover Stats
 */
exports.getCoverStats = async (libraryId) => {
  const booksWithCover = await Book.countDocuments({ libraryId, coverImage: { $ne: null } });
  const booksWithoutCover = await Book.countDocuments({ libraryId, coverImage: null });
  const totalUploads = await AuditLog.countDocuments({ libraryId, action: { $in: ["COVER_UPLOADED", "COVER_REPLACED"] } });

  return {
    booksWithCover,
    booksWithoutCover,
    totalUploads,
    storageUsed: "N/A" // Real calculation would require pinging Cloudinary Admin API
  };
};
