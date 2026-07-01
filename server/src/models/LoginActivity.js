const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library"
    },
    email: {
      type: String
    },
    ipAddress: {
      type: String
    },
    browser: {
      type: String
    },
    os: {
      type: String
    },
    country: {
      type: String
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "LOCKED"],
      required: true
    }
  },
  { timestamps: true }
);

// Indexes for faster querying in the dashboard
loginActivitySchema.index({ libraryId: 1, createdAt: -1 });
loginActivitySchema.index({ status: 1 });
loginActivitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("LoginActivity", loginActivitySchema);
