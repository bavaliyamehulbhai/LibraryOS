const BookCopy = require("../models/BookCopy");

const generateCopyCode = async (libraryId) => {
  // Find the most recently created copy for this library
  const lastCopy = await BookCopy.findOne({ libraryId })
    .sort({ createdAt: -1 })
    .select("copyCode");

  let nextNumber = 1;

  if (lastCopy && lastCopy.copyCode) {
    // Extract the number from BOOK-000001
    const parts = lastCopy.copyCode.split("-");
    if (parts.length === 2 && !isNaN(parts[1])) {
      nextNumber = parseInt(parts[1], 10) + 1;
    }
  }

  // Format as BOOK-000001
  const paddedNumber = String(nextNumber).padStart(6, '0');
  return `BOOK-${paddedNumber}`;
};

const generateBulkCopyCodes = async (libraryId, quantity) => {
  const lastCopy = await BookCopy.findOne({ libraryId })
    .sort({ createdAt: -1 })
    .select("copyCode");

  let nextNumber = 1;

  if (lastCopy && lastCopy.copyCode) {
    const parts = lastCopy.copyCode.split("-");
    if (parts.length === 2 && !isNaN(parts[1])) {
      nextNumber = parseInt(parts[1], 10) + 1;
    }
  }

  const codes = [];
  for (let i = 0; i < quantity; i++) {
    const paddedNumber = String(nextNumber + i).padStart(6, '0');
    codes.push(`BOOK-${paddedNumber}`);
  }

  return codes;
};

module.exports = {
  generateCopyCode,
  generateBulkCopyCodes
};
