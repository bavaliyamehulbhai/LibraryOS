const mongoose = require("mongoose");

const vendorDocumentSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    documentType: { 
      type: String, 
      enum: ["GST Certificate", "PAN Card", "Trade License", "Bank Proof"],
      required: true 
    },
    fileUrl: { type: String, required: true },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("VendorDocument", vendorDocumentSchema);
