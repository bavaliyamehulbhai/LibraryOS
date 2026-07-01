const mongoose = require('mongoose');

const tenantFeatureSchema = new mongoose.Schema({
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Library', // Library corresponds to Tenant in our architecture
    required: true,
    index: true 
  },
  featureId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Feature',
    required: true,
    index: true
  },
  enabled: { 
    type: Boolean, 
    default: true 
  },
  overriddenBy: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' // Typically a SUPER_ADMIN
  }
}, { timestamps: true });

// A tenant can only override a feature once
tenantFeatureSchema.index({ tenantId: 1, featureId: 1 }, { unique: true });

module.exports = mongoose.model('TenantFeature', tenantFeatureSchema);
