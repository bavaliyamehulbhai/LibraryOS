const mongoose = require("mongoose");

const marketplaceOrderItemSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "MarketplaceBook", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const marketplaceOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    items: [marketplaceOrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"], 
      default: "PENDING" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketplaceOrder", marketplaceOrderSchema);
