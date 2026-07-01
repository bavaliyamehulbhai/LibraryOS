const mongoose = require("mongoose");

const branchSettingSchema = new mongoose.Schema({
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
    index: true
  },
  openingTime: { type: String, default: "09:00" },
  closingTime: { type: String, default: "18:00" },
  maxBorrowDays: { type: Number, default: 14 },
  finePerDay: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model("BranchSetting", branchSettingSchema);
