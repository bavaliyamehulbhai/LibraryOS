const memberService = require("../services/memberService");
const auditService = require("../services/auditService");
const usageTrackingService = require("../services/usageTrackingService");

exports.registerMember = async (req, res) => {
  try {
    await usageTrackingService.checkMemberLimit(req.user.libraryId);
    const member = await memberService.createMember(req.user.libraryId, req.body);
    await auditService.createActivityLog({
      userId: req.user._id,
      action: "MEMBER_CREATED",
      module: "MEMBER",
      description: `Registered new member ${member.memberCode}`,
      libraryId: req.user.libraryId
    });
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const member = await memberService.updateMember(req.user.libraryId, req.params.id, req.body);
    await auditService.createActivityLog({
      userId: req.user._id,
      action: "MEMBER_UPDATED",
      module: "MEMBER",
      description: `Updated member ${member.memberCode}`,
      libraryId: req.user.libraryId
    });
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMemberHistory = async (req, res) => {
  try {
    const history = await memberService.getMemberHistory(req.user.libraryId, req.params.id);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllMembers = async (req, res) => {
  try {
    const result = await memberService.getAllMembers(req.user.libraryId, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const member = await memberService.getMemberById(req.user.libraryId, req.params.id);
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const member = await memberService.updateMemberStatus(req.user.libraryId, req.params.id, req.body.status);
    await auditService.createActivityLog({
      userId: req.user._id,
      action: `MEMBER_${req.body.status}`,
      module: "MEMBER",
      description: `Changed status of member ${member.memberCode} to ${req.body.status}`,
      libraryId: req.user.libraryId
    });
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyMember = async (req, res) => {
  try {
    const member = await memberService.verifyMember(req.user.libraryId, req.params.id);
    await auditService.createActivityLog({
      userId: req.user._id,
      action: "MEMBER_VERIFIED",
      module: "MEMBER",
      description: `Verified member ${member.memberCode}`,
      libraryId: req.user.libraryId
    });
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const data = await memberService.getMemberAnalytics(req.user.libraryId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
