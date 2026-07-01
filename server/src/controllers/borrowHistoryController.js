const borrowHistoryService = require("../services/borrowHistoryService");
const BorrowHistory = require("../models/BorrowHistory");

exports.getDashboard = async (req, res) => {
  try {
    const data = await borrowHistoryService.getHistoryDashboard(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMemberTimeline = async (req, res) => {
  try {
    const events = await borrowHistoryService.getMemberTimeline(req.user.libraryId, req.params.memberId);
    const stats = await borrowHistoryService.getMemberStats(req.user.libraryId, req.params.memberId);
    res.status(200).json({ success: true, data: events, stats });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getBookHistory = async (req, res) => {
  try {
    const events = await borrowHistoryService.getBookHistory(req.user.libraryId, req.params.bookId);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getGlobalHistory = async (req, res) => {
  try {
    const query = { libraryId: req.user.libraryId };
    if (req.query.action) query.action = req.query.action;
    if (req.query.memberId) query.memberId = req.query.memberId;

    const page = parseInt(req.query.page) || 1;
    const limit = 50;

    const [history, total] = await Promise.all([
      BorrowHistory.find(query)
        .populate("memberId", "firstName lastName memberCode")
        .populate("bookId", "title")
        .sort({ actionDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      BorrowHistory.countDocuments(query)
    ]);

    res.status(200).json({ success: true, data: history, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
