const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  entity: { type: String, default: "SYSTEM" },
  entityId: { type: String },
  oldData: { type: Object },
  newData: { type: Object },
  details: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library"
  }
}, { timestamps: true });

// Pre-save hook to fallback performedBy if userId is given
auditLogSchema.pre('save', function() {
  if (this.userId && !this.performedBy) {
    this.performedBy = this.userId;
  }
});

module.exports = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
