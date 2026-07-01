const bookImportService = require("../services/bookImportService");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a CSV or Excel file." });
    }
    const job = await bookImportService.queueImport(req.file, req.user.libraryId, req.user._id);
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const data = await bookImportService.getJobProgress(req.params.jobId, req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const data = await bookImportService.getImportHistory(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getErrors = async (req, res) => {
  try {
    const csvData = await bookImportService.getErrorCSV(req.params.jobId, req.user.libraryId);
    res.header("Content-Type", "text/csv");
    res.attachment(`import_errors_${req.params.jobId}.csv`);
    return res.send(csvData);
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.downloadTemplate = async (req, res) => {
  try {
    const csvData = bookImportService.generateTemplate();
    res.header("Content-Type", "text/csv");
    res.attachment("libraryos_import_template.csv");
    return res.send(csvData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const data = await bookImportService.getStats(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
