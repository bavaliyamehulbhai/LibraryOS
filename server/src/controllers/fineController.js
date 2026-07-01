const fineService = require("../services/fineService");
const Fine = require("../models/Fine");

exports.createManualFine = async (req, res) => {
  try {
    const { memberId, amount, reason } = req.body;
    const fine = await fineService.createManualFine(req.user.libraryId, memberId, amount, reason, req.user._id);
    res.status(201).json({ success: true, data: fine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getFines = async (req, res) => {
  try {
    const query = { libraryId: req.user.libraryId };
    if (req.query.status) query.status = req.query.status;
    if (req.query.memberId) query.memberId = req.query.memberId;

    const fines = await Fine.find(query)
      .populate("memberId", "firstName lastName memberCode")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: fines });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getFineById = async (req, res) => {
  try {
    const fine = await Fine.findOne({ _id: req.params.id, libraryId: req.user.libraryId })
      .populate("memberId", "firstName lastName memberCode")
      .populate("transactionId", "transactionCode");
    if (!fine) return res.status(404).json({ success: false, message: "Fine not found" });
    res.status(200).json({ success: true, data: fine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.waiveFine = async (req, res) => {
  try {
    const { reason } = req.body;
    const fine = await fineService.waiveFine(req.user.libraryId, req.params.id, reason, req.user._id);
    res.status(200).json({ success: true, data: fine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
