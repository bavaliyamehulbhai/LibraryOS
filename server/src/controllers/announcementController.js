const Announcement = require("../models/Announcement");
const AuditLog = require("../models/AuditLog");

const createAnnouncement = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const { title, content, type, expiresAt } = req.body;

    const announcement = new Announcement({
      title,
      content,
      type,
      libraryId,
      createdBy: req.user._id,
      expiresAt
    });

    await announcement.save();

    await AuditLog.create({
      action: "ANNOUNCEMENT_CREATED",
      module: "COMMUNICATION",
      userId: req.user._id,
      libraryId,
      description: `Created announcement: ${title}`
    });

    return res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const now = new Date();

    const announcements = await Announcement.find({
      libraryId,
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gte: now } }]
    }).sort({ publishDate: -1 }).lean();

    return res.json({ success: true, data: announcements });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements
};
