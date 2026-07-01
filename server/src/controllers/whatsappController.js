const WhatsAppLog = require("../models/WhatsAppLog");
const WhatsAppTemplate = require("../models/WhatsAppTemplate");

exports.getDashboard = async (req, res) => {
  try {
    const [sent, delivered, read, failed] = await Promise.all([
      WhatsAppLog.countDocuments({ libraryId: req.user.libraryId, status: { $in: ["SENT", "DELIVERED", "READ"] } }),
      WhatsAppLog.countDocuments({ libraryId: req.user.libraryId, status: { $in: ["DELIVERED", "READ"] } }),
      WhatsAppLog.countDocuments({ libraryId: req.user.libraryId, status: "READ" }),
      WhatsAppLog.countDocuments({ libraryId: req.user.libraryId, status: "FAILED" })
    ]);
    res.status(200).json({ success: true, data: { sent, delivered, read, failed } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await WhatsAppLog.find({ libraryId: req.user.libraryId })
      .populate("memberId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────
exports.getTemplates = async (req, res) => {
  try {
    const templates = await WhatsAppTemplate.find({ libraryId: req.user.libraryId }).sort({ eventType: 1 });
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.upsertTemplate = async (req, res) => {
  try {
    const { eventType, message, isActive, templateCode, name, interactiveButtons } = req.body;
    let template = await WhatsAppTemplate.findOne({ libraryId: req.user.libraryId, eventType });
    
    if (template) {
      template.message = message;
      template.isActive = isActive;
      template.name = name;
      template.interactiveButtons = interactiveButtons || [];
      await template.save();
    } else {
      template = await WhatsAppTemplate.create({
        templateCode: templateCode || `WATMP-${Date.now()}`,
        name: name || eventType.replace(/_/g, " "),
        eventType,
        message,
        interactiveButtons: interactiveButtons || [],
        isActive,
        libraryId: req.user.libraryId
      });
    }
    res.status(200).json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
