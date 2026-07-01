const publisherService = require("../services/publisherService");
const Publisher = require("../models/Publisher");
const { createPublisherSchema, updatePublisherSchema } = require("../validators/publisherValidator");
const AuditLog = require("../models/AuditLog");

exports.createPublisher = async (req, res) => {
  try {
    const { error, value } = createPublisherSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const libraryId = req.user.libraryId;

    const exists = await Publisher.findOne({ name: value.name, libraryId, isActive: true });
    if (exists) {
      return res.status(400).json({ success: false, message: "Publisher with this name already exists" });
    }

    const publisherData = { ...value, libraryId };
    const publisher = await publisherService.createPublisher(publisherData);

    await AuditLog.create({
      action: "PUBLISHER_CREATED",
      entity: "PUBLISHER",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      details: `Publisher ${publisher.name} created.`
    });

    res.status(201).json({ success: true, data: publisher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPublishers = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const result = await publisherService.getPublishers(req.query, libraryId);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPublisher = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const publisher = await publisherService.getPublisherById(req.params.id, libraryId);
    if (!publisher) {
      return res.status(404).json({ success: false, message: "Publisher not found" });
    }
    res.status(200).json({ success: true, data: publisher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePublisher = async (req, res) => {
  try {
    const { error, value } = updatePublisherSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const libraryId = req.user.libraryId;

    if (value.name) {
      const exists = await Publisher.findOne({ 
        name: value.name, 
        libraryId, 
        isActive: true,
        _id: { $ne: req.params.id }
      });
      if (exists) {
        return res.status(400).json({ success: false, message: "Publisher with this name already exists" });
      }
    }

    const publisher = await publisherService.updatePublisher(req.params.id, libraryId, value);

    if (!publisher) {
      return res.status(404).json({ success: false, message: "Publisher not found" });
    }

    await AuditLog.create({
      action: "PUBLISHER_UPDATED",
      entity: "PUBLISHER",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      details: `Publisher ${publisher.name} updated.`
    });

    res.status(200).json({ success: true, data: publisher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePublisher = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const publisher = await publisherService.deletePublisher(req.params.id, libraryId);

    if (!publisher) {
      return res.status(404).json({ success: false, message: "Publisher not found" });
    }

    await AuditLog.create({
      action: "PUBLISHER_DELETED",
      entity: "PUBLISHER",
      userId: req.user._id,
      libraryId: req.user.libraryId,
      details: `Publisher ${publisher.name} deleted.`
    });

    res.status(200).json({ success: true, data: publisher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPublisherStats = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const stats = await publisherService.getPublisherStats(req.params.id, libraryId);
    if (!stats) {
      return res.status(404).json({ success: false, message: "Publisher not found" });
    }
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
