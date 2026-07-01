const mongoose = require("mongoose");

const platformAuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    targetOrganizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization"
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { 
    timestamps: { createdAt: "timestamp", updatedAt: false } 
  }
);

// Immutable
platformAuditLogSchema.pre('updateOne', function(next) {
  next(new Error("Platform Audit logs are immutable."));
});
platformAuditLogSchema.pre('findOneAndUpdate', function(next) {
  next(new Error("Platform Audit logs are immutable."));
});

module.exports = mongoose.model("PlatformAuditLog", platformAuditLogSchema);
