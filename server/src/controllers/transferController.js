const transferService = require("../services/transferService");

exports.requestTransfer = async (req, res) => {
  try {
    const { fromBranch, toBranch, bookCopy, notes } = req.body;
    const transfer = await transferService.requestTransfer(
      req.user.libraryId,
      fromBranch,
      toBranch,
      bookCopy,
      req.user._id,
      notes
    );
    res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const branchId = req.query.branchId; // Optional filter
    const transfers = await transferService.getTransfers(req.user.libraryId, branchId);
    res.status(200).json({ success: true, data: transfers });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.approveTransfer = async (req, res) => {
  try {
    const transfer = await transferService.approveTransfer(req.user.libraryId, req.params.id, req.user._id);
    res.status(200).json({ success: true, data: transfer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.markInTransit = async (req, res) => {
  try {
    const transfer = await transferService.markInTransit(req.user.libraryId, req.params.id);
    res.status(200).json({ success: true, data: transfer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.receiveTransfer = async (req, res) => {
  try {
    const transfer = await transferService.receiveTransfer(req.user.libraryId, req.params.id);
    res.status(200).json({ success: true, data: transfer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
