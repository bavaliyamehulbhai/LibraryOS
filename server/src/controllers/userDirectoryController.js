const User = require("../models/User");
const { inviteUser } = require("../services/invitationService");

const getUsers = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const users = await User.find({ libraryId })
      .populate("roleId departmentId teamId")
      .select("-password -passkeys");
    
    require("fs").writeFileSync("getUsersDebug.json", JSON.stringify({
      libraryId,
      count: users.length,
      success: true
    }));

    return res.json({ success: true, data: users });
  } catch (error) {
    require("fs").writeFileSync("getUsersDebug.json", JSON.stringify({ error: error.message }));
    return res.status(500).json({ success: false, message: error.message });
  }
};

const inviteNewUser = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const { email, roleId } = req.body;

    const invitation = await inviteUser(email, roleId, libraryId, req.user._id);

    return res.json({ success: true, message: "Invitation sent successfully", data: invitation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, inviteNewUser };
