const mongoose = require("mongoose");

const insightSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library" },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "LOW"
  },
  type: {
    type: String,
    enum: ["GROWTH", "DROP", "WARNING", "OPPORTUNITY"],
    default: "GROWTH"
  }
}, { timestamps: true });

module.exports = mongoose.model("Insight", insightSchema);
