const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },
    branchCode: {
      type: String,
      required: true,
      unique: true
    },
    branchName: {
      type: String,
      required: true
    },
    isHeadOffice: {
      type: Boolean,
      default: false
    },
    address: {
      country: { type: String, default: "India" },
      state: String,
      city: String,
      area: String,
      pincode: String,
      addressLine1: String,
      addressLine2: String
    },
    contactInfo: {
      phone: String,
      email: String,
      managerName: String
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

// A tenant should only have one head office branch
branchSchema.index({ libraryId: 1, isHeadOffice: 1 }, { unique: true, partialFilterExpression: { isHeadOffice: true } });

module.exports = mongoose.model("Branch", branchSchema);
