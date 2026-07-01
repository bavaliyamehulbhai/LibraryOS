const Role = require("../models/Role");
const Permission = require("../models/Permission");
const User = require("../models/User");
const auditService = require("../services/auditService");

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({ libraryId: req.user.libraryId }).populate("permissions");
    
    // Get user counts for each role
    const rolesWithCounts = await Promise.all(roles.map(async (r) => {
      const userCount = await User.countDocuments({ roleId: r._id, libraryId: req.user.libraryId });
      return { ...r.toObject(), userCount };
    }));

    res.status(200).json({ success: true, data: rolesWithCounts });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const libraryId = req.user.libraryId;

    const existing = await Role.findOne({ name, libraryId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Role with this name already exists in your library" });
    }

    const role = await Role.create({
      name,
      description,
      permissions,
      libraryId,
      isSystem: false
    });

    await auditService.createActivityLog({
      userId: req.user.id || req.user._id,
      libraryId,
      action: "ROLE_CREATED",
      module: "Security",
      description: `Created new role: ${name}`
    });

    res.status(201).json({ success: true, data: role });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const libraryId = req.user.libraryId;

    const role = await Role.findOne({ _id: req.params.id, libraryId });
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    if (role.isSystem) {
      return res.status(403).json({ success: false, message: "Cannot modify system roles" });
    }

    role.name = name || role.name;
    role.description = description || role.description;
    role.permissions = permissions || role.permissions;

    await role.save();

    await auditService.createActivityLog({
      userId: req.user.id || req.user._id,
      libraryId,
      action: "ROLE_UPDATED",
      module: "Security",
      description: `Updated role: ${role.name}`
    });

    res.status(200).json({ success: true, data: role });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const role = await Role.findOne({ _id: req.params.id, libraryId });
    
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    if (role.isSystem) {
      return res.status(403).json({ success: false, message: "Cannot delete system roles" });
    }

    const usersUsingRole = await User.countDocuments({ roleId: role._id });
    if (usersUsingRole > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete role. ${usersUsingRole} users are currently assigned to it.` });
    }

    await role.deleteOne();

    await auditService.createActivityLog({
      userId: req.user.id || req.user._id,
      libraryId,
      action: "ROLE_DELETED",
      module: "Security",
      description: `Deleted role: ${role.name}`
    });

    res.status(200).json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    const userId = req.params.id;
    const libraryId = req.user.libraryId;

    const role = await Role.findOne({ _id: roleId, libraryId });
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    const targetUser = await User.findOne({ _id: userId, libraryId });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    targetUser.roleId = role._id;
    // fallback
    targetUser.role = role.name; 
    await targetUser.save();

    await auditService.createActivityLog({
      userId: req.user.id || req.user._id,
      libraryId,
      action: "ROLE_ASSIGNED",
      module: "Security",
      description: `Assigned role ${role.name} to user ${targetUser.email}`
    });

    res.status(200).json({ success: true, message: "Role assigned successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
