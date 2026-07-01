const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '1m' } // Mongoose TTL index to automatically delete expired OTPs
  },
  attempts: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  context: {
    type: String,
    enum: ["LOGIN", "REGISTRATION", "PASSWORD_RESET"],
    default: "LOGIN"
  }
}, { timestamps: true });

module.exports = mongoose.model("Otp", otpSchema);
