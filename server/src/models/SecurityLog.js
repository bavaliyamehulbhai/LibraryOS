const mongoose = require("mongoose");

const securityLogSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    default: "LOW"
  },
  ipAddress: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  details: {
    type: String
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library"
  }
}, { timestamps: true });

module.exports = mongoose.model("SecurityLog", securityLogSchema);
