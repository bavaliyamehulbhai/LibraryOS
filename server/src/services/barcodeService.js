const bwipjs = require("bwip-js");
const BookCopy = require("../models/BookCopy");
const BarcodeScanLog = require("../models/BarcodeScanLog");
const AuditLog = require("../models/AuditLog");
const bookCopyService = require("./bookCopyService");

const generateBarcode = async (code) => {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: "code128",       // Barcode type
      text: code,            // Text to encode
      scale: 3,              // 3x scaling factor
      height: 10,            // Bar height, in millimeters
      includetext: true,     // Show human-readable text
      textxalign: "center",  // Always good to set this
    }, function (err, png) {
      if (err) {
        reject(err);
      } else {
        const base64Str = `data:image/png;base64,${png.toString("base64")}`;
        resolve(base64Str);
      }
    });
  });
};

const generateBulkBarcodes = async (codes) => {
  const promises = codes.map(code => generateBarcode(code).then(url => ({ code, url })));
  return await Promise.all(promises);
};

// If we need a specific copy ID to generate and return its base64:
const generateForCopy = async (copyId, libraryId) => {
  const copy = await BookCopy.findOne({ _id: copyId, libraryId });
  if (!copy) throw new Error("Copy not found");
  
  const url = await generateBarcode(copy.copyCode);
  
  // Optionally store the URL back to the copy, though we can always generate it on the fly.
  if (!copy.barcode) {
    copy.barcode = copy.copyCode;
    await copy.save();
  }

  return url;
};

// Scan Logic
const processScan = async (barcode, action, libraryId, userId) => {
  const copy = await BookCopy.findOne({ 
    libraryId,
    $or: [{ copyCode: barcode }, { barcode: barcode }]
  }).populate("bookId", "title isbn coverImage");

  if (!copy) throw new Error("Barcode not found or invalid.");

  let resultCopy = copy;

  if (action === "ISSUE") {
    resultCopy = await bookCopyService.issueCopy(copy._id, libraryId, userId);
  } else if (action === "RETURN") {
    resultCopy = await bookCopyService.returnCopy(copy._id, libraryId, userId, "Returned via Barcode Scan");
  }

  await BarcodeScanLog.create({
    copyId: copy._id,
    userId,
    libraryId,
    action: action || "SCAN"
  });

  return {
    copy: resultCopy,
    book: copy.bookId
  };
};

const getStats = async (libraryId) => {
  const totalBarcodes = await BookCopy.countDocuments({ libraryId, barcode: { $exists: true, $ne: null } });
  
  // Scans today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const scansToday = await BarcodeScanLog.countDocuments({ 
    libraryId, 
    createdAt: { $gte: startOfDay } 
  });

  return {
    totalBarcodes,
    scansToday
  };
};

module.exports = {
  generateBarcode,
  generateBulkBarcodes,
  generateForCopy,
  processScan,
  getStats
};
