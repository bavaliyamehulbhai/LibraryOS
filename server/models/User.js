const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "STUDENT"],
    required: true 
  },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library' },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
