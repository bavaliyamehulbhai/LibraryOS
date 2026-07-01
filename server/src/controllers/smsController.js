const SmsLog = require("../models/SmsLog");
const SmsTemplate = require("../models/SmsTemplate");
const Otp = require("../models/Otp");

exports.getDashboard = async (req, res) => {
  try {
    const [sent, delivered, failed, pending] = await Promise.all([
      SmsLog.countDocuments({ libraryId: req.user.libraryId, status: { $in: ["SENT", "DELIVERED"] } }),
      SmsLog.countDocuments({ libraryId: req.user.libraryId, status: "DELIVERED" }),
      SmsLog.countDocuments({ libraryId: req.user.libraryId, status: "FAILED" }),
      SmsLog.countDocuments({ libraryId: req.user.libraryId, status: "PENDING" })
    ]);
    res.status(200).json({ success: true, data: { sent, delivered, failed, pending } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await SmsLog.find({ libraryId: req.user.libraryId })
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
    const templates = await SmsTemplate.find({ libraryId: req.user.libraryId }).sort({ eventType: 1 });
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.upsertTemplate = async (req, res) => {
  try {
    const { eventType, message, isActive, templateCode, name } = req.body;
    let template = await SmsTemplate.findOne({ libraryId: req.user.libraryId, eventType });
    
    if (template) {
      template.message = message;
      template.isActive = isActive;
      template.name = name;
      await template.save();
    } else {
      template = await SmsTemplate.create({
        templateCode: templateCode || `STMP-${Date.now()}`,
        name: name || eventType.replace(/_/g, " "),
        eventType,
        message,
        isActive,
        libraryId: req.user.libraryId
      });
    }
    res.status(200).json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// OTP SYSTEM
// ─────────────────────────────────────────────
exports.sendOtp = async (req, res) => {
  try {
    const { phone, context = "LOGIN" } = req.body;
    
    // Generate 6-digit OTP
    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes

    // Delete existing unverified OTP for this phone/context
    await Otp.deleteMany({ phone, context, verified: false });

    await Otp.create({
      phone,
      otp: otpValue, // In production, never log or send this in API response
      expiresAt,
      context
    });

    // Directly queue the SMS via Notification Queue
    const createQueue = require("../services/queueService");
    const notificationQueue = createQueue("notifications");
    
    // MOCK: in a real app you'd find member by phone
    await notificationQueue.add("send_sms", {
      phone,
      message: `Your LibraryOS OTP is ${otpValue}. Valid for 5 minutes. Do not share this with anyone.`,
      libraryId: req.user.libraryId
    });

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp, context = "LOGIN" } = req.body;
    
    const record = await Otp.findOne({ phone, context, verified: false });
    
    if (!record) {
      return res.status(400).json({ success: false, message: "OTP expired or not found" });
    }

    if (record.attempts >= 5) {
      return res.status(400).json({ success: false, message: "Too many failed attempts. Request a new OTP." });
    }

    if (record.otp !== otp) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    record.verified = true;
    await record.save();

    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
