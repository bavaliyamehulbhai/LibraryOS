const aiStudyService = require("../services/aiStudyService");

exports.getProgress = async (req, res) => {
  try {
    const profile = await aiStudyService.getOrCreateProfile(req.user.id, req.user.libraryId);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generate = async (req, res) => {
  try {
    const { mode, topic, content } = req.body;
    if (!mode || (!topic && !content)) {
      return res.status(400).json({ success: false, message: "Mode and Topic/Content are required" });
    }
    
    const aiResponse = await aiStudyService.generateContent(req.user.id, req.user.libraryId, mode, topic, content);
    res.json({ success: true, data: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
