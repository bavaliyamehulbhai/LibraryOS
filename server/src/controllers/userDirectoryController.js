const User = require("../models/User");
const { inviteUser } = require("../services/invitationService");

const getUsers = async (req, res) => {
  try {
    const libraryId = req.user.role === 'SUPER_ADMIN' ? null : req.user.libraryId;
    const filter = {};
    if (libraryId) filter.libraryId = libraryId;

    const users = await User.find(filter)
      .populate("roleId departmentId teamId")
      .select("-password -passkeys");
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const inviteNewUser = async (req, res) => {
  try {
    const libraryId = req.user.libraryId || req.body.libraryId; // Fallback for Super Admins
    const { email, roleId } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    if (!roleId) return res.status(400).json({ success: false, message: "Role is required" });

    // Ensure we have a libraryId for the new user
    if (!libraryId) {
       return res.status(400).json({ success: false, message: "Library ID is required to invite users." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    // Extract name from email (e.g. john.doe@... -> John Doe)
    const namePrefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
    const name = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);

    const newUser = await User.create({
      name,
      email,
      password: "Password123!", // Default password
      roleId,
      libraryId,
      status: "ACTIVE",
      emailVerified: true
    });

    // Also create the invitation record for audit logs
    const invitation = await inviteUser(email, roleId, libraryId, req.user._id || req.user.id);

    return res.json({ 
      success: true, 
      message: "User created successfully with default password: Password123!", 
      data: newUser, 
      inviteLink: `/accept-invite?token=${invitation.token}` 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const libraryId = req.user.role === 'SUPER_ADMIN' ? null : req.user.libraryId;
    const { name, roleId, designation, status } = req.body;

    const query = { _id: req.params.id };
    if (libraryId) query.libraryId = libraryId;

    const user = await User.findOne(query);
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
    const libraryId = req.user.role === 'SUPER_ADMIN' ? null : req.user.libraryId;
    const query = { _id: req.params.id };
    if (libraryId) query.libraryId = libraryId;

    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.status = "SUSPENDED";
    user.isActive = false;
    await user.save();
    return res.json({ success: true, message: "User suspended successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const restoreUser = async (req, res) => {
  try {
    const libraryId = req.user.role === 'SUPER_ADMIN' ? null : req.user.libraryId;
    const query = { _id: req.params.id };
    if (libraryId) query.libraryId = libraryId;

    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.status = "ACTIVE";
    user.isActive = true;
    await user.save();
    return res.json({ success: true, message: "User restored successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, inviteNewUser, updateUser, suspendUser, restoreUser };
