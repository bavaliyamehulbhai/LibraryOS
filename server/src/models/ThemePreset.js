const mongoose = require('mongoose');

const themePresetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  primaryColor: String,
  secondaryColor: String,
  accentColor: String,
  fontFamily: String,
  dashboardLayout: String
}, { timestamps: true });

module.exports = mongoose.model('ThemePreset', themePresetSchema);
