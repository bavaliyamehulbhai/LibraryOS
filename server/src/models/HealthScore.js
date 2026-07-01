const mongoose = require("mongoose");

const healthScoreSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
  score: { type: Number, required: true },
  status: {
    type: String,
    enum: ["EXCELLENT", "HEALTHY", "WARNING", "CRITICAL"],
    required: true
  },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("HealthScore", healthScoreSchema);
