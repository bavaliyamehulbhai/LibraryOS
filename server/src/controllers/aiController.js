const intentService = require("../services/intentService");
const toolRouter = require("../services/toolRouter");
const aiService = require("../services/aiService");
const ChatSession = require("../models/ChatSession");
const ChatMessage = require("../models/ChatMessage");

exports.chat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const libraryId = req.user.libraryId;

    let currentSessionId = sessionId;

    // Create session if it doesn't exist
    if (!currentSessionId) {
      const newSession = await ChatSession.create({
        libraryId,
        userId: req.user._id || req.user.id,
        title: message.substring(0, 30) + "..."
      });
      currentSessionId = newSession._id;
    }

    // Save User Message
    await ChatMessage.create({
      sessionId: currentSessionId,
      role: "user",
      content: message
    });

    // 1. Detect Intent
    const intent = intentService.detectIntent(message);

    // 2. Route to Database / Service
    const dbResult = await toolRouter.routeIntent(intent, libraryId, req.user);

    // 3. Generate AI Response
    const aiResponseContent = await aiService.generateResponse(message, dbResult);

    // Save Assistant Message
    const assistantMessage = await ChatMessage.create({
      sessionId: currentSessionId,
      role: "assistant",
      content: aiResponseContent,
      metadata: { intent, dbResult }
    });

    res.json({
      success: true,
      data: {
        sessionId: currentSessionId,
        message: assistantMessage
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id || req.user.id, isActive: true }).sort({ updatedAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
