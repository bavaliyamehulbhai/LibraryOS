const mongoose = require("mongoose");

const purchaseRequestItemSchema = new mongoose.Schema({
  bookTitle: { type: String, required: true },
  author: { type: String },
  quantity: { type: Number, required: true },
  estimatedPrice: { type: Number, required: true }
});

const purchaseRequestSchema = new mongoose.Schema(
  {
    requestNumber: { type: String, required: true, unique: true },
    libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String },
    reason: { type: String },
    estimatedCost: { type: Number, required: true },
    items: [purchaseRequestItemSchema],
    status: { 
      type: String, 
      enum: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "CANCELLED"], 
      default: "SUBMITTED" 
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseRequest", purchaseRequestSchema);
