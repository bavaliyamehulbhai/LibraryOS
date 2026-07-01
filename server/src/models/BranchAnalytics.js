const mongoose = require("mongoose");

const branchAnalyticsSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    metrics: {
      books: {
        total: { type: Number, default: 0 },
        added: { type: Number, default: 0 },
        removed: { type: Number, default: 0 },
        available: { type: Number, default: 0 },
        lost: { type: Number, default: 0 }
      },
      members: {
        total: { type: Number, default: 0 },
        active: { type: Number, default: 0 },
        new: { type: Number, default: 0 },
        inactive: { type: Number, default: 0 }
      },
      circulation: {
        issues: { type: Number, default: 0 },
        returns: { type: Number, default: 0 },
        renewals: { type: Number, default: 0 },
        reservations: { type: Number, default: 0 }
      },
      revenue: {
        total: { type: Number, default: 0 },
        membershipFees: { type: Number, default: 0 },
        fines: { type: Number, default: 0 },
        events: { type: Number, default: 0 },
        services: { type: Number, default: 0 }
      },
      inventory: {
        totalValue: { type: Number, default: 0 },
        assets: { type: Number, default: 0 }
      },
      staff: {
        total: { type: Number, default: 0 },
        booksProcessedPerStaff: { type: Number, default: 0 }
      },
      scores: {
        performance: { type: Number, default: 0 },
        efficiency: { type: Number, default: 0 },
        health: { type: Number, default: 0 }
      }
    }
  },
  { timestamps: true }
);

// Compound index for querying a specific branch on a specific date
branchAnalyticsSchema.index({ libraryId: 1, branchId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("BranchAnalytics", branchAnalyticsSchema);
