const settingService = require("../services/settingService");
const { updateSettingsSchema } = require("../validators/settingValidator");
const AuditLog = require("../models/AuditLog");

const getSettings = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const settings = await settingService.getSettings(libraryId);
    return res.json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { error, value } = updateSettingsSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const settings = await settingService.updateSettings(req.user.libraryId, value);

    await AuditLog.create({
      action: "SETTINGS_UPDATED",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      description: "General library settings were updated"
    });

    return res.json({ success: true, message: "Settings updated", data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateBranding = async (req, res) => {
  try {
    const { libraryName, primaryColor, secondaryColor, website, customDomain, companyName } = req.body;
    
    const settings = await settingService.updateSettings(req.user.libraryId, {
      libraryName, primaryColor, secondaryColor, website, customDomain, companyName
    });

    await AuditLog.create({
      action: "BRANDING_UPDATED",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      description: "Library branding and theme settings were updated"
    });

    return res.json({ success: true, message: "Branding updated", data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateRules = async (req, res) => {
  try {
    const { finePerDay, maxBorrowDays, maxBooksPerStudent } = req.body;
    
    const settings = await settingService.updateSettings(req.user.libraryId, {
      finePerDay, maxBorrowDays, maxBooksPerStudent
    });

    await AuditLog.create({
      action: "RULES_UPDATED",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      description: "Borrowing and fine rules were updated"
    });

    return res.json({ success: true, message: "Rules updated", data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateNotifications = async (req, res) => {
  try {
    const { emailNotifications, smsNotifications, overdueReminder, dueReminder, smtpHost, smtpPort, smtpEmail, smtpPassword } = req.body;
    
    const settings = await settingService.updateSettings(req.user.libraryId, {
      emailNotifications, smsNotifications, overdueReminder, dueReminder, smtpHost, smtpPort, smtpEmail, smtpPassword
    });

    await AuditLog.create({
      action: "NOTIFICATIONS_UPDATED",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      description: "Notification preferences and SMTP settings were updated"
    });

    return res.json({ success: true, message: "Notifications updated", data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image file provided" });
    
    const settings = await settingService.updateSettings(req.user.libraryId, {
      logo: req.file.path
    });

    return res.json({ success: true, url: req.file.path, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadFavicon = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image file provided" });
    
    const settings = await settingService.updateSettings(req.user.libraryId, {
      favicon: req.file.path
    });

    return res.json({ success: true, url: req.file.path, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  updateBranding,
  updateRules,
  updateNotifications,
  uploadLogo,
  uploadFavicon
};
