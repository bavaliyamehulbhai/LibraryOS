const mongoose = require("mongoose");

const attendanceLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    entryTime: { type: Date, required: true, default: Date.now },
    exitTime: { type: Date },
    status: {
      type: String,
      enum: ["IN", "OUT"],
      default: "IN"
    },
    durationMinutes: { type: Number, default: 0 },
    autoPunchedOut: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Indexes to speed up queries
attendanceLogSchema.index({ user: 1, status: 1 });
attendanceLogSchema.index({ libraryId: 1, entryTime: -1 });

module.exports = mongoose.model("AttendanceLog", attendanceLogSchema);
