const crypto = require("crypto");
const UserInvitation = require("../models/UserInvitation");
const AuditLog = require("../models/AuditLog");

const inviteUser = async (email, roleId, libraryId, invitedBy) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation = await UserInvitation.create({
    email,
    roleId,
    libraryId,
    invitedBy,
    token,
    expiresAt
  });

  // Mock sending email
  // sendEmail(email, "You are invited to LibraryOS", `Link: /accept-invite?token=${token}`);

  await AuditLog.create({
    action: "USER_INVITED",
    libraryId,
    description: `User ${email} was invited to the platform.`
  });

  return invitation;
};

const validateToken = async (token) => {
  const invitation = await UserInvitation.findOne({ token, status: "PENDING" });
  if (!invitation || invitation.expiresAt < new Date()) {
    throw new Error("Invalid or expired token");
  }
  return invitation;
};

module.exports = {
  inviteUser,
  validateToken
};
