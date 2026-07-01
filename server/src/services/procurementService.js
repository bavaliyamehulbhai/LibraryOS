const PurchaseRequest = require("../models/PurchaseRequest");
const Budget = require("../models/Budget");
const GoodsReceipt = require("../models/GoodsReceipt");
const MarketplaceOrder = require("../models/MarketplaceOrder");
const MarketplaceBook = require("../models/MarketplaceBook");
const Book = require("../models/Book"); // Core Library Book Model
const mongoose = require("mongoose");

exports.submitRequest = async (libraryId, userId, data) => {
  const requestNumber = `PR-${Date.now()}`;
  const pr = await PurchaseRequest.create({
    requestNumber,
    libraryId,
    requestedBy: userId,
    ...data,
    status: "SUBMITTED"
  });
  return pr;
};

exports.approveRequest = async (requestId, adminId) => {
  const pr = await PurchaseRequest.findById(requestId);
  if (!pr) throw new Error("Purchase Request not found");
  if (pr.status !== "SUBMITTED") throw new Error("Request must be in SUBMITTED state");

  // Check budget
  const budget = await Budget.findOne({ libraryId: pr.libraryId, fiscalYear: new Date().getFullYear().toString() });
  if (!budget) throw new Error("No budget found for this fiscal year");
  
  if (budget.remainingBudget < pr.estimatedCost) {
    throw new Error(`Insufficient budget. Remaining: ₹${budget.remainingBudget}`);
  }

  // Update budget
  budget.utilizedBudget += pr.estimatedCost;
  budget.remainingBudget -= pr.estimatedCost;
  await budget.save();

  // Approve PR
  pr.status = "APPROVED";
  pr.approvedBy = adminId;
  await pr.save();

  return pr;
};

exports.createGRN = async (libraryId, userId, poId, items) => {
  const po = await MarketplaceOrder.findById(poId);
  if (!po) throw new Error("Purchase Order not found");

  const grnNumber = `GRN-${Date.now()}`;
  const grn = await GoodsReceipt.create({
    grnNumber,
    purchaseOrderId: poId,
    libraryId,
    receivedBy: userId,
    items,
    status: "VERIFIED"
  });

  // Automatically update the main Library Inventory (Book.js) based on GRN
  for (const item of items) {
    // In a real system, we'd map this back to standard books. 
    // We'll create basic Book entries to simulate inventory update.
    for (let i = 0; i < item.quantityReceived; i++) {
      await Book.create({
        title: item.bookTitle,
        libraryId,
        addedBy: userId,
        status: "AVAILABLE",
        isbn: `INV-${Date.now()}-${i}`
      });
    }
  }

  // Mark PO as DELIVERED
  po.status = "DELIVERED";
  await po.save();

  return grn;
};
