const mongoose = require("mongoose");

const studyProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true
    },
    studyHours: {
      type: Number,
      default: 0
    },
    quizzesCompleted: {
      type: Number,
      default: 0
    },
    notesGenerated: {
      type: Number,
      default: 0
    },
    summariesGenerated: {
      type: Number,
      default: 0
    },
    favoriteTopics: [{
      type: String
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyProfile", studyProfileSchema);
