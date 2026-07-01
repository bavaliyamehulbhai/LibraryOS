const mongoose = require("mongoose");

const userInvitationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  status: { type: String, enum: ["PENDING", "ACCEPTED", "EXPIRED"], default: "PENDING" },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model("UserInvitation", userInvitationSchema);
