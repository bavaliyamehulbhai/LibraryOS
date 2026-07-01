const gamificationService = require("../services/gamificationService");

exports.getProfile = async (req, res) => {
  try {
    const profile = await gamificationService.getProfile(req.user.id, req.user.libraryId);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await gamificationService.getLeaderboard(req.user.libraryId);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// For demo purposes (Action Simulator)
exports.simulateAction = async (req, res) => {
  try {
    const { amount } = req.body;
    const result = await gamificationService.addXP(req.user.id, req.user.libraryId, amount || 50);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
