const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Permission"
  }],
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library"
  },
  isSystem: {
    type: Boolean,
    default: false // to prevent deletion of default roles
  }
}, { timestamps: true });

module.exports = mongoose.model("Role", roleSchema);
