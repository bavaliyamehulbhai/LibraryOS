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
    const libraryId = req.user.libraryId;
    const count = await Event.countDocuments({ libraryId });
    if (count === 0) {
       const futureDate = new Date();
       futureDate.setDate(futureDate.getDate() + 5);
       
       const endDate = new Date(futureDate);
       endDate.setHours(endDate.getHours() + 2);

       await Event.create({
          libraryId,
          organizerId: req.user.id || req.user._id,
          title: "Introduction to Artificial Intelligence in Libraries",
          description: "Join us for an interactive workshop on how AI is transforming digital libraries, content curation, and member experiences.",
          eventType: "WORKSHOP",
          startDate: futureDate,
          endDate: endDate,
          venue: "Main Conference Room, Level 2",
          maxParticipants: 50,
          registeredCount: 0,
          status: "PUBLISHED"
       });
    }

    const events = await Event.find({ libraryId })
      .populate("organizerId", "firstName lastName")
      .sort({ startDate: 1 });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    if (!userId) {
       return res.status(400).json({ success: false, message: "User ID not found in token" });
    }
    const registrations = await EventRegistration.find({ userId })
      .select("eventId status")
      .lean();
    res.json({ success: true, data: registrations });
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
