const Team = require("../models/Team");

const getTeams = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const teams = await Team.find({ libraryId }).populate("managerId members", "name email designation profilePhoto");
    return res.json({ success: true, data: teams });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createTeam = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const { name, description, managerId, members } = req.body;

    const team = await Team.create({
      libraryId,
      name,
      description,
      managerId,
      members
    });

    return res.status(201).json({ success: true, message: "Team created", data: team });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTeams, createTeam };
