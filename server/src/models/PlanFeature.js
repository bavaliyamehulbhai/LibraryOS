const mongoose = require('mongoose');

const planFeatureSchema = new mongoose.Schema({
  planId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Plan',
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
  }
}, { timestamps: true });

// A plan can only define a feature once
planFeatureSchema.index({ planId: 1, featureId: 1 }, { unique: true });

module.exports = mongoose.model('PlanFeature', planFeatureSchema);
