const mongoose = require("mongoose");

const onboardingAnalyticsSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
  droppedAtStep: { type: String },
  timeTakenMinutes: { type: Number, default: 0 },
  status: { type: String, enum: ["STARTED", "DROPPED", "COMPLETED"], default: "STARTED" }
}, { timestamps: true });

module.exports = mongoose.model("OnboardingAnalytics", onboardingAnalyticsSchema);
