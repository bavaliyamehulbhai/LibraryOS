const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: false,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    index: true
  },
  otp: {
    type: String,
    required: false
  },
  code: {
    type: String,
    required: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '1m' } 
  },
  attempts: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  context: {
    type: String,
    enum: ["LOGIN", "REGISTRATION", "PASSWORD_RESET"],
    default: "LOGIN"
  },
  purpose: {
    type: String,
    default: "LOGIN"
  }
}, { timestamps: true });

module.exports = mongoose.model("Otp", otpSchema);
