const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    libraryId: { // This acts as the tenantId for isolation
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
      unique: true // 1 Tenant = 1 Organization Profile for now
    },
    organizationCode: {
      type: String,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String
    },
    phone: {
      type: String
    },
    website: {
      type: String
    },
    description: {
      type: String
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
    businessInfo: {
      gstNumber: String,
      registrationNumber: String,
      establishedYear: Number
    },
    branding: {
      logo: String,
      favicon: String,
      primaryColor: { type: String, default: "#3B82F6" },
      secondaryColor: String
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
