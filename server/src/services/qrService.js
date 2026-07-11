const QRCode = require("qrcode");
const BookCopy = require("../models/BookCopy");
const QRScanLog = require("../models/QRScanLog");
const AuditLog = require("../models/AuditLog");

const generateQRCode = async (copyCode, libraryId) => {
  const copy = await BookCopy.findOne({ copyCode, libraryId });
  if (!copy) throw new Error("Copy not found");

  const qrData = {
    copyId: copy._id,
    bookId: copy.bookId,
    copyCode: copy.copyCode,
    libraryId: copy.libraryId,
    url: `${process.env.CLIENT_URL || "http://localhost:5173"}/public/copies/${copy._id}`
  };

  const qrString = JSON.stringify(qrData);

  // Generate Base64 Data URI
  const qrImage = await QRCode.toDataURL(qrString, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300
  });

  if (!copy.qrCode || !copy.qrData) {
    copy.qrCode = qrImage;
    copy.qrData = qrString;
    await copy.save();
  }

  return { qrImage, qrData };
};

const generateBulkQRCodes = async (bookId, libraryId) => {
  const copies = await BookCopy.find({ bookId, libraryId });
  if (!copies.length) throw new Error("No copies found for this book");

  const results = [];
  for (const copy of copies) {
    const data = await generateQRCode(copy.copyCode, libraryId);
    results.push({
      copyId: copy._id,
      copyCode: copy.copyCode,
      qrImage: data.qrImage
    });
  }

  return results;
};

const scanQRCode = async (copyCode, libraryId, userId, device = "Web Scanner") => {
  const copy = await BookCopy.findOne({ copyCode, libraryId })
    .populate("bookId", "title author isbn coverImage")
    .populate({
      path: "shelfId",
      populate: { path: "floorId sectionId rackId" }
    });

  if (!copy) throw new Error("Invalid QR Code or Copy not found");

  // Log the scan
  await QRScanLog.create({
    copyId: copy._id,
    userId,
    libraryId,
    action: "SCAN",
    device
  });

  return {
    book: copy.bookId,
    copy: {
      _id: copy._id,
      copyCode: copy.copyCode,
      status: copy.status,
      condition: copy.condition
    },
    location: copy.shelfId ? {
      floor: copy.shelfId.floorId?.name,
      section: copy.shelfId.sectionId?.name,
      rack: copy.shelfId.rackId?.rackCode,
      shelf: copy.shelfId.shelfCode
    } : null
  };
};

const getQRCodeData = async (copyId, libraryId) => {
  const copy = await BookCopy.findOne({ _id: copyId, libraryId })
    .populate("bookId", "title author isbn coverImage publisher category")
    .populate({
      path: "shelfId",
      populate: { path: "floorId sectionId rackId" }
    });

  if (!copy) throw new Error("Copy not found");

  // This is often hit by public visitors
  await QRScanLog.create({
    copyId: copy._id,
    libraryId,
    action: "VIEW",
    device: "Mobile/Public"
  });

  return {
    book: copy.bookId,
    copy: {
      _id: copy._id,
      copyCode: copy.copyCode,
      status: copy.status,
      condition: copy.condition,
      qrImage: copy.qrCode
    },
    location: copy.shelfId ? {
      floor: copy.shelfId.floorId?.name,
      section: copy.shelfId.sectionId?.name,
      rack: copy.shelfId.rackId?.rackCode,
      shelf: copy.shelfId.shelfCode
    } : null
  };
};

const getStats = async (libraryId) => {
  const totalQRs = await BookCopy.countDocuments({ libraryId, qrCode: { $exists: true, $ne: null } });
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const scansToday = await QRScanLog.countDocuments({ 
    libraryId, 
    createdAt: { $gte: startOfDay } 
  });

  const totalScans = await QRScanLog.countDocuments({ libraryId });

  return {
    totalQRs,
    scansToday,
    totalScans
  };
};

const circulationService = require("./circulationService");
const Transaction = require("../models/Transaction");

const selfCheckout = async (copyCode, libraryId, userId) => {
  const copy = await BookCopy.findOne({ copyCode, libraryId });
  if (!copy) throw new Error("Copy not found");
  
  // Find member record for this user
  const Member = require("../models/Member");
  const member = await Member.findOne({ userId, libraryId });
  if (!member) throw new Error("You do not have an active library membership");

  // Call the robust circulation logic
  const transaction = await circulationService.issueBook(libraryId, member._id, copy._id, userId);

  await QRScanLog.create({
    copyId: copy._id,
    userId,
    libraryId,
    action: "SCAN", // Or create a new enum for CHECKOUT
    device: "Self-Checkout Portal"
  });

  return transaction;
};

const selfReturn = async (copyCode, libraryId, userId) => {
  const copy = await BookCopy.findOne({ copyCode, libraryId });
  if (!copy) throw new Error("Copy not found");

  // Find active transaction for this copy
  const activeTx = await Transaction.findOne({ bookCopyId: copy._id, libraryId, status: { $in: ["ISSUED", "RENEWED", "OVERDUE"] } });
  if (!activeTx) throw new Error("This book is not currently issued to anyone");

  // Call robust return logic (automatically handles fines if overdue)
  const transaction = await circulationService.returnBook(libraryId, activeTx._id, userId);

  await QRScanLog.create({
    copyId: copy._id,
    userId,
    libraryId,
    action: "SCAN",
    device: "Self-Return Portal"
  });

  return transaction;
};

module.exports = {
  generateQRCode,
  generateBulkQRCodes,
  scanQRCode,
  getQRCodeData,
  getStats,
  selfCheckout,
  selfReturn
};
