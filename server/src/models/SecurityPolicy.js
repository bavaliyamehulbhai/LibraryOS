const mongoose = require("mongoose");

const securityPolicySchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
      unique: true
    },
    passwordMinLength: {
      type: Number,
      default: 8
    },
    require2FA: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number, // in minutes
      default: 1440 // 24 hours
    },
    maxLoginAttempts: {
      type: Number,
      default: 5
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SecurityPolicy", securityPolicySchema);
