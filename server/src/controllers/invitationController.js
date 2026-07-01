const crypto = require("crypto");
const Invitation = require("../models/Invitation");
const User = require("../models/User");
const Organization = require("../models/Organization");
const ComplianceLog = require("../models/ComplianceLog");
const { sendEmail } = require("../services/emailService");
const ROLES = require("../constants/roles");

const inviteUser = async (req, res) => {
  try {
    const { email, role, organizationId } = req.body;

    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const Organization = require("../models/Organization");
    const Library = require("../models/Library");
    
    const targetOrgId = organizationId || req.user.libraryId;

    let org = null;
    if (targetOrgId) {
      org = await Organization.findById(targetOrgId);
      if (!org) {
        org = await Library.findById(targetOrgId);
      }
    }
    
    if (!org) return res.status(404).json({ success: false, message: "Organization/Library not found" });

    // Use the found org's ID for consistency
    const finalOrgId = org._id;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Check for existing pending invitation
    let invitation = await Invitation.findOne({ email, organizationId: finalOrgId });
    if (invitation) {
      return res.status(400).json({ success: false, message: "Invitation already sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    invitation = await Invitation.create({
      email,
      role,
      organizationId: finalOrgId,
      invitedBy: req.user.id,
      token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const inviteUrl = `${process.env.CLIENT_URL}/accept-invite?token=${token}`;

    const orgName = org.name || org.libraryName || "Library OS";

    const html = `
      <h1>You have been invited to join ${orgName}</h1>
      <p>Click the link below to set up your account and join the organization:</p>
      <a href="${inviteUrl}" style="padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
      <p>This invitation expires in 7 days.</p>
    `;

    await sendEmail({ email, subject: `Invitation to join ${orgName}`, html });

    await ComplianceLog.create({
      action: "INVITE_USER",
      actorId: req.user.id,
      organizationId,
      metadata: { invitedEmail: email, role }
    });

    res.json({ success: true, message: "Invitation sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    const invitation = await Invitation.findOne({ token, expiresAt: { $gt: Date.now() } });
    if (!invitation) {
      return res.status(400).json({ success: false, message: "Invalid or expired invitation" });
    }

    const user = await User.create({
      name,
      email: invitation.email,
      password,
      role: invitation.role,
      libraryId: invitation.organizationId, // Maps to LibraryId for MVP
      emailVerified: true
    });

    await ComplianceLog.create({
      action: "ACCEPT_INVITATION",
      actorId: user._id,
      targetId: user._id,
      organizationId: invitation.organizationId,
      metadata: { role: invitation.role }
    });

    await Invitation.deleteOne({ _id: invitation._id });

    res.json({ success: true, message: "Account created successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  inviteUser,
  acceptInvitation
};
