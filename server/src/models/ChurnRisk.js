const mongoose = require("mongoose");

const churnRiskSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
  score: { type: Number, required: true }, // Out of 100, higher is worse
  riskLevel: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    required: true
  },
  reasons: [String]
}, { timestamps: true });

module.exports = mongoose.model("ChurnRisk", churnRiskSchema);
