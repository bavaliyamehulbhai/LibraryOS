const mongoose = require("mongoose");

const onboardingSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true, unique: true },
  currentStep: {
    type: String,
    enum: ["LIBRARY_SETUP", "ADMIN_SETUP", "BRANCH_SETUP", "BOOK_IMPORT", "STUDENT_IMPORT", "SETTINGS_SETUP", "COMPLETE"],
    default: "LIBRARY_SETUP"
  },
  completedSteps: [{ type: String }],
  completionPercentage: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Onboarding", onboardingSchema);
