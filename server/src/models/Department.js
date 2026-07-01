const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
  name: { type: String, required: true },
  headId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Department", departmentSchema);
