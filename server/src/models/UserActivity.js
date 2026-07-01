const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library" },
  activityType: { type: String, required: true },
  metadata: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model("UserActivity", userActivitySchema);
