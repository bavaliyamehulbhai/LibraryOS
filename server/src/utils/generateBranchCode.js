const Library = require("../models/Library");
const Branch = require("../models/Branch");

const generateBranchCode = async (libraryId, branchName) => {
  const library = await Library.findById(libraryId).lean();
  if (!library) throw new Error("Library not found");

  const libraryCode = library.code; // e.g., APL001
  
  // Extract first 3 letters or handle short names
  const branchPrefix = branchName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
  
  const baseCode = `${libraryCode}-${branchPrefix}`;

  // Ensure uniqueness
  let finalCode = baseCode;
  let counter = 1;
  while (await Branch.exists({ branchCode: finalCode })) {
    finalCode = `${baseCode}${counter}`;
    counter++;
  }

  return finalCode;
};

module.exports = { generateBranchCode };
