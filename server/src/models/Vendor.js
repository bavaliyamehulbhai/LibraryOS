const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    gstNumber: { type: String },
    address: { type: String },
    status: { 
      type: String, 
      enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"], 
      default: "PENDING" 
    },
    rating: { type: Number, default: 0 },
    // SLA & Performance
    ordersCompleted: { type: Number, default: 0 },
    revenueGenerated: { type: Number, default: 0 },
    riskScore: { 
      type: String, 
      enum: ["LOW", "MEDIUM", "HIGH"], 
      default: "LOW" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
