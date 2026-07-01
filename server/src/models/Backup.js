const mongoose = require("mongoose");

const backupSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING" },
  error: { type: String },
  backupDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Backup", backupSchema);
