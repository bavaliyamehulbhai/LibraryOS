const mongoose = require("mongoose");

const marketplaceBookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    isbn: { type: String, required: true },
    author: { type: String, required: true },
    publisher: { type: String },
    category: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    coverImage: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketplaceBook", marketplaceBookSchema);
