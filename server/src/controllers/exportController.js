const bookExportService = require("../services/bookExportService");

exports.requestExport = async (req, res) => {
  try {
    const { type, format, filters } = req.body;
    if (!type || !format) {
      return res.status(400).json({ success: false, message: "Type and format are required." });
    }
    const job = await bookExportService.requestExport(type, format, filters, req.user.libraryId, req.user._id);
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const data = await bookExportService.getExportProgress(req.params.jobId, req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const data = await bookExportService.getExportHistory(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.downloadExport = async (req, res) => {
  try {
    const job = await bookExportService.downloadExport(req.params.jobId, req.user.libraryId);
    res.download(job.filePath, job.fileName + "." + job.format);
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.scheduleExport = async (req, res) => {
  try {
    const data = await bookExportService.scheduleExport(req.body, req.user.libraryId, req.user._id);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getScheduledExports = async (req, res) => {
  try {
    const data = await bookExportService.getScheduledExports(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const data = await bookExportService.getStats(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
