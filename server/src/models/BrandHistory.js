const mongoose = require('mongoose');

const brandHistorySchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true,
    index: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed, // Stores the previous branding state before the update
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('BrandHistory', brandHistorySchema);
