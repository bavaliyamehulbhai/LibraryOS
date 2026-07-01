const mongoose = require("mongoose");
const { ACTIVE, TRIAL, SUSPENDED, EXPIRED } = require('../constants/libraryStatus');

const librarySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: "India" },
  pincode: { type: String, required: true },
  logo: { type: String, default: "" },
  website: { type: String, default: "" },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  onboardingCompleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  status: {
    type: String,
    enum: [ACTIVE, TRIAL, SUSPENDED, EXPIRED],
    default: TRIAL
  },
  trialEndsAt: { type: Date }
}, { timestamps: true });

librarySchema.virtual("libraryAge").get(function() {
  const diffTime = Math.abs(new Date() - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
});

// Important Indexes
librarySchema.index({ city: 1 });
librarySchema.index({ status: 1 });
librarySchema.index({ city: 1, status: 1 });

module.exports = mongoose.model("Library", librarySchema);
