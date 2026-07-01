const EmailLog = require("../models/EmailLog");
const EmailTemplate = require("../models/EmailTemplate");
const path = require("path");

exports.getDashboard = async (req, res) => {
  try {
    const [sent, delivered, failed, opened] = await Promise.all([
      EmailLog.countDocuments({ libraryId: req.user.libraryId, status: { $in: ["SENT", "OPENED"] } }),
      EmailLog.countDocuments({ libraryId: req.user.libraryId, status: { $in: ["SENT", "OPENED"] } }), // Delivery tracking via SMTP is complex, treating SENT as delivered for now
      EmailLog.countDocuments({ libraryId: req.user.libraryId, status: "FAILED" }),
      EmailLog.countDocuments({ libraryId: req.user.libraryId, status: "OPENED" })
    ]);
    res.status(200).json({ success: true, data: { sent, delivered, failed, opened } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await EmailLog.find({ libraryId: req.user.libraryId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// TRACKING PIXEL
// ─────────────────────────────────────────────
exports.trackOpen = async (req, res) => {
  try {
    const { logId } = req.params;
    const logIdWithoutExt = logId.replace(".png", "");
    
    await EmailLog.findOneAndUpdate(
      { _id: logIdWithoutExt, status: "SENT" },
      { status: "OPENED", openedAt: new Date() }
    );
  } catch (error) {
    // Ignore tracking errors so we don't break the image load
    console.error("[EmailTrack] Error tracking open:", error.message);
  }

  // Send a transparent 1x1 pixel
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': pixel.length,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end(pixel);
};

// ─────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────
exports.getTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find({ libraryId: req.user.libraryId }).sort({ eventType: 1 });
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.upsertTemplate = async (req, res) => {
  try {
    const { eventType, subject, htmlContent, isActive, templateCode, name } = req.body;
    let template = await EmailTemplate.findOne({ libraryId: req.user.libraryId, eventType });
    
    if (template) {
      template.subject = subject;
      template.htmlContent = htmlContent;
      template.isActive = isActive;
      template.name = name;
      await template.save();
    } else {
      template = await EmailTemplate.create({
        templateCode: templateCode || `ETMP-${Date.now()}`,
        name: name || eventType.replace(/_/g, " "),
        eventType,
        subject,
        htmlContent,
        isActive,
        libraryId: req.user.libraryId
      });
    }
    res.status(200).json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
