const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const eventService = require("../services/eventService");

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      libraryId: req.user.libraryId,
      organizerId: req.user._id
    });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ libraryId: req.user.libraryId })
      .populate("organizerId", "firstName lastName")
      .sort({ startDate: 1 });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const result = await eventService.registerForEvent(req.params.id, req.user._id);
    res.json({ success: true, data: result.reg, message: `Successfully ${result.status}` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ eventId: req.params.id })
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: 1 });
    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const reg = await eventService.markAttendance(req.params.regId);
    res.json({ success: true, data: reg, message: "Attendance marked & Certificate Generated!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.generateAIIdea = async (req, res) => {
  try {
    const idea = await eventService.generateEventIdea(req.body.prompt);
    res.json({ success: true, data: idea });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
