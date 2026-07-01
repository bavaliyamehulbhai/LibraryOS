const fs = require("fs");
const pdfParse = require("pdf-parse");
const DigitalResource = require("../models/DigitalResource");

exports.extractMetadata = async (filePath, mimetype) => {
  const metadata = {
    totalPages: 0,
    extractedText: ""
  };

  try {
    if (mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      metadata.totalPages = data.numpages || 0;
      // Truncating text to first 500 chars to save space/DB overhead
      metadata.extractedText = (data.text || "").substring(0, 500);
    }
  } catch (error) {
    console.error("Metadata extraction failed:", error.message);
  }

  return metadata;
};

exports.createResource = async (resourceData) => {
  return await DigitalResource.create(resourceData);
};
