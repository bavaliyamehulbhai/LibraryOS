const mongoose = require("mongoose");

const publisherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  website: {
    type: String
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  country: {
    type: String
  },
  logo: {
    type: String
  },
  description: {
    type: String
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

publisherSchema.index({ name: 1, libraryId: 1 }, { unique: true });
publisherSchema.index({ name: "text" });

module.exports = mongoose.model("Publisher", publisherSchema);
