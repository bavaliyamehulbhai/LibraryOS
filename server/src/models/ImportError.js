const mongoose = require("mongoose");

const importErrorSchema = new mongoose.Schema({
  rowNumber: { type: Number, required: true },
  error: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }, // Original row data
  importJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ImportJob",
    required: true
  }
}, { timestamps: true });

importErrorSchema.index({ importJobId: 1 });

module.exports = mongoose.model("ImportError", importErrorSchema);
