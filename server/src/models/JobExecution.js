const mongoose = require("mongoose");

const jobExecutionSchema = new mongoose.Schema({
  jobName: { type: String, required: true },
  status: { type: String, enum: ["SUCCESS", "FAILED", "RUNNING"], default: "RUNNING" },
  error: { type: String },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model("JobExecution", jobExecutionSchema);
