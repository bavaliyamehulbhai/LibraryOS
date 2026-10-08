const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const { callChatCompletion } = require("../utils/aiClient");

exports.registerForEvent = async (eventId, userId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");
  if (event.status !== "PUBLISHED") throw new Error("Event is not currently open for registration");

  // Check capacity
  const currentRegistrations = await EventRegistration.countDocuments({ eventId, status: "REGISTERED" });
  
  const status = currentRegistrations >= event.maxParticipants ? "WAITLISTED" : "REGISTERED";

  try {
    const reg = await EventRegistration.create({ eventId, userId, status });
    return { reg, status };
  } catch (error) {
    if (error.code === 11000) throw new Error("You are already registered for this event");
    throw error;
  }
};

exports.markAttendance = async (registrationId) => {
  const reg = await EventRegistration.findById(registrationId).populate("eventId");
  if (!reg) throw new Error("Registration not found");
  
  if (reg.status !== "REGISTERED") throw new Error("Only registered users can be marked as attended");
  
  reg.status = "ATTENDED";
  reg.certificateIssued = true; // Auto-issue certificate upon attendance
  await reg.save();

  return reg;
};

exports.generateEventIdea = async (promptText) => {
  if (!process.env.GROQ_API_KEY) {
    return {
       title: "API Key Missing",
       description: "AI Features are disabled without a GROQ_API_KEY. Please provide a title manually."
    };
  }

  try {
    const prompt = `You are an expert library community manager. The library admin wants to host an event about: "${promptText}".
Provide a catchy event Title and a 2-sentence professional Description suitable for a modern tech-forward library.
Format as JSON: { "title": "Catchy Title", "description": "Professional description." }`;

    const response = await callChatCompletion({
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }]
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Groq AI Event Error:", error.message);
    return {
      title: `${promptText.charAt(0).toUpperCase() + promptText.slice(1)} Workshop & Interactive Session`,
      description: `Join us for an engaging session on ${promptText}. Open to all members looking to expand their knowledge.`
    };
  }
};
