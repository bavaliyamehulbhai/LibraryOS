const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  biography: {
    type: String
  },
  country: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  email: {
    type: String
  },
  website: {
    type: String
  },
  image: {
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

authorSchema.index({ name: 1, libraryId: 1 }, { unique: true });
authorSchema.index({ name: "text", biography: "text" });

module.exports = mongoose.model("Author", authorSchema);
