const issueService = require("../services/issueService");

exports.issueBook = async (req, res) => {
  try {
    const { memberId, copyId } = req.body;
    const transaction = await issueService.issueBook(req.user.libraryId, memberId, copyId, req.user._id);
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getIssues = async (req, res) => {
  try {
    const issues = await issueService.getIssues(req.user.libraryId, req.query);
    res.status(200).json({ success: true, data: issues });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getIssueDetails = async (req, res) => {
  try {
    const issue = await issueService.getIssueDetails(req.user.libraryId, req.params.id);
    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};
