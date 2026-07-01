const User = require("../models/User");
const { inviteUser } = require("../services/invitationService");

const getUsers = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const users = await User.find({ libraryId })
      .populate("roleId departmentId teamId")
      .select("-password -passkeys");
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const inviteNewUser = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const { email, roleId } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    if (!roleId) return res.status(400).json({ success: false, message: "Role is required" });

    const invitation = await inviteUser(email, roleId, libraryId, req.user._id || req.user.id);

    // TODO: Send invite email when SMTP is configured
    // For now, just return success with the invite link
    return res.json({ success: true, message: "Invitation created successfully", data: invitation, inviteLink: `/accept-invite?token=${invitation.token}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const { name, roleId, designation, status } = req.body;

    const user = await User.findOne({ _id: req.params.id, libraryId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (name) user.name = name;
    if (roleId) user.roleId = roleId;
    if (designation) user.designation = designation;
    if (status) user.status = status;

    await user.save();
    return res.json({ success: true, message: "User updated successfully", data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const suspendUser = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const user = await User.findOne({ _id: req.params.id, libraryId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.status = "SUSPENDED";
    user.isActive = false;
    await user.save();
    return res.json({ success: true, message: "User suspended successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, inviteNewUser, updateUser, suspendUser };
