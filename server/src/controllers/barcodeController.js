const barcodeService = require("../services/barcodeService");
const barcodePrintService = require("../services/barcodePrintService");

exports.generateSingle = async (req, res) => {
  try {
    const { copyId } = req.body;
    const url = await barcodeService.generateForCopy(copyId, req.user.libraryId);
    res.status(200).json({ success: true, data: { barcodeUrl: url } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.generateBulkForBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const data = await barcodePrintService.getPrintDataForBook(bookId, req.user.libraryId, req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPrintData = async (req, res) => {
  try {
    const { copyIds } = req.body;
    const data = await barcodePrintService.getPrintDataForCopies(copyIds, req.user.libraryId, req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.scanBarcode = async (req, res) => {
  try {
    const { barcode, action } = req.body; // action can be 'ISSUE', 'RETURN', or just 'SCAN'/'VERIFY'
    const result = await barcodeService.processScan(barcode, action, req.user.libraryId, req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await barcodeService.getStats(req.user.libraryId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
