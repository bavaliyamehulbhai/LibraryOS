const BookCopy = require("../models/BookCopy");
const barcodeService = require("./barcodeService");
const AuditLog = require("../models/AuditLog");

const getPrintDataForBook = async (bookId, libraryId, userId) => {
  const copies = await BookCopy.find({ bookId, libraryId }).populate("bookId", "title");
  if (!copies.length) throw new Error("No copies found for this book");

  const codes = copies.map(c => c.copyCode);
  const generated = await barcodeService.generateBulkBarcodes(codes);

  // Mark that these barcodes were fetched for printing
  await AuditLog.create({
    action: "BARCODE_PRINTED",
    entity: "BOOK",
    userId,
    libraryId,
    details: `Generated printable barcodes for ${copies.length} copies of book ${bookId}`
  });

  return generated.map((gen, idx) => ({
    copyId: copies[idx]._id,
    copyCode: copies[idx].copyCode,
    bookTitle: copies[idx].bookId.title,
    barcodeUrl: gen.url
  }));
};

const getPrintDataForCopies = async (copyIds, libraryId, userId) => {
  const copies = await BookCopy.find({ _id: { $in: copyIds }, libraryId }).populate("bookId", "title");
  if (!copies.length) throw new Error("No copies found");

  const codes = copies.map(c => c.copyCode);
  const generated = await barcodeService.generateBulkBarcodes(codes);

  await AuditLog.create({
    action: "BARCODE_PRINTED",
    entity: "BOOK_COPY",
    userId,
    libraryId,
    details: `Generated printable barcodes for ${copies.length} specific copies`
  });

  return generated.map((gen, idx) => ({
    copyId: copies[idx]._id,
    copyCode: copies[idx].copyCode,
    bookTitle: copies[idx].bookId.title,
    barcodeUrl: gen.url
  }));
};

module.exports = {
  getPrintDataForBook,
  getPrintDataForCopies
};
