const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    fiscalYear: { type: String, required: true },
    allocatedBudget: { type: Number, required: true, default: 0 },
    utilizedBudget: { type: Number, required: true, default: 0 },
    remainingBudget: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Budget", budgetSchema);
