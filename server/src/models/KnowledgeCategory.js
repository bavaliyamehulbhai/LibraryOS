const mongoose = require('mongoose');

const knowledgeCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  icon: String, // lucide-react icon name or URL
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library", // Allows custom categories per tenant if needed, or null for global
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeCategory', knowledgeCategorySchema);
