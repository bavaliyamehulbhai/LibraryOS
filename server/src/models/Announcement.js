const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ["GENERAL", "HOLIDAY", "MAINTENANCE", "EVENT", "URGENT"],
    default: "GENERAL"
  },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  publishDate: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);
