const Library = require('../models/Library');

/**
 * Generates a unique library code based on the library name
 * @param {string} libraryName - The name of the library
 * @returns {Promise<string>} - The generated unique code
 */
const generateLibraryCode = async (libraryName) => {
  // Take first 3 letters of library name or pad with 'X'
  const prefix = libraryName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');

  // Find the last library with this prefix
  const lastLibrary = await Library.findOne({ code: new RegExp(`^${prefix}`) })
    .sort({ code: -1 })
    .lean();

  let nextNumber = 1;
  if (lastLibrary && lastLibrary.code) {
    const lastNumberStr = lastLibrary.code.substring(3);
    const lastNumber = parseInt(lastNumberStr, 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  const paddedNumber = String(nextNumber).padStart(3, '0');
  return `${prefix}${paddedNumber}`;
};

module.exports = {
  generateLibraryCode
};
