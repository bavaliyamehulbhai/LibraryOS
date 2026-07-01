const mongoose = require("mongoose");

const entityHistorySchema = new mongoose.Schema({
  entity: { type: String, required: true },
  entityId: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library" },
  oldData: { type: Object },
  newData: { type: Object },
  changedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("EntityHistory", entityHistorySchema);
