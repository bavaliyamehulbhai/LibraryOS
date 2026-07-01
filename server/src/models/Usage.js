const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema({
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true,
    unique: true,
    index: true
  },
  usersCount: { type: Number, default: 0 },
  booksCount: { type: Number, default: 0 },
  branchesCount: { type: Number, default: 0 },
  storageUsed: { type: Number, default: 0 } // in MB
}, { timestamps: true });

module.exports = mongoose.model("Usage", usageSchema);
