const qrService = require("../services/qrService");

exports.generateSingle = async (req, res) => {
  try {
    const { copyCode } = req.body;
    const { qrImage } = await qrService.generateQRCode(copyCode, req.user.libraryId);
    res.status(200).json({ success: true, data: { qrUrl: qrImage } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.generateBulk = async (req, res) => {
  try {
    const { bookId } = req.body;
    const data = await qrService.generateBulkQRCodes(bookId, req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.scanQR = async (req, res) => {
  try {
    const { copyCode, device } = req.body;
    const data = await qrService.scanQRCode(copyCode, req.user.libraryId, req.user._id, device);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// This is the public API route. No auth required except libraryId inference or public access.
exports.getQRData = async (req, res) => {
  try {
    // We assume the URL contains the copyId. For a public route, we might need a library lookup
    // or assume the libraryId is passed as query param or inferred.
    // For now, let's assume we pass libraryId in query param or it's fetched from tenant middleware.
    // To keep it simple, we use the copyId. We might need to bypass tenant isolation for purely public views if libraryId isn't sent.
    // However, assuming tenant isolation is active, the public route needs the library context.
    const { copyId } = req.params;
    const libraryId = req.query.libraryId || req.libraryId; // Fallback
    
    if (!libraryId) {
      return res.status(400).json({ success: false, message: "Library Context Required" });
    }

    const data = await qrService.getQRCodeData(copyId, libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await qrService.getStats(req.user.libraryId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
