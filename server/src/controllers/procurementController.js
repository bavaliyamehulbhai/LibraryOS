const PurchaseRequest = require("../models/PurchaseRequest");
const Budget = require("../models/Budget");
const GoodsReceipt = require("../models/GoodsReceipt");
const procurementService = require("../services/procurementService");

exports.submitRequest = async (req, res) => {
  try {
    const pr = await procurementService.submitRequest(req.user.libraryId, req.user._id, req.body);
    res.status(201).json({ success: true, data: pr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await PurchaseRequest.find({ libraryId: req.user.libraryId })
      .populate("requestedBy", "firstName lastName")
      .populate("approvedBy", "firstName lastName")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const pr = await procurementService.approveRequest(req.params.id, req.user._id);
    res.json({ success: true, data: pr, message: "Purchase Request Approved" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getBudget = async (req, res) => {
  try {
    const year = new Date().getFullYear().toString();
    let budget = await Budget.findOne({ libraryId: req.user.libraryId, fiscalYear: year });
    
    // Auto-create a dummy budget for demo if it doesn't exist
    if (!budget) {
      budget = await Budget.create({
        libraryId: req.user.libraryId,
        fiscalYear: year,
        allocatedBudget: 500000,
        remainingBudget: 500000
      });
    }
    
    res.json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createGRN = async (req, res) => {
  try {
    const { poId, items } = req.body;
    const grn = await procurementService.createGRN(req.user.libraryId, req.user._id, poId, items);
    res.status(201).json({ success: true, data: grn, message: "Goods Receipt Note Created & Inventory Updated" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getGRNs = async (req, res) => {
  try {
    const grns = await GoodsReceipt.find({ libraryId: req.user.libraryId })
      .populate("purchaseOrderId", "orderNumber")
      .populate("receivedBy", "firstName lastName")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: grns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
