const mongoose = require("mongoose");

const grnItemSchema = new mongoose.Schema({
  bookTitle: { type: String, required: true },
  quantityReceived: { type: Number, required: true },
  condition: { type: String, default: "Good" }
});

const goodsReceiptSchema = new mongoose.Schema(
  {
    grnNumber: { type: String, required: true, unique: true },
    purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "MarketplaceOrder", required: true },
    libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receivedDate: { type: Date, default: Date.now },
    items: [grnItemSchema],
    status: { 
      type: String, 
      enum: ["PENDING_VERIFICATION", "VERIFIED", "DISCREPANCY"], 
      default: "VERIFIED" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoodsReceipt", goodsReceiptSchema);
