const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
  libraryName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  logo: { type: String },
  subscriptionPlan: {
    type: String,
    enum: ["FREE", "PRO", "ENTERPRISE"],
    default: "FREE"
  },
  subscriptionStatus: {
    type: String,
    enum: ["ACTIVE", "EXPIRED", "TRIAL"],
    default: "TRIAL"
  },
  maxBooks: { type: Number },
  maxStudents: { type: Number },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Library', librarySchema);
