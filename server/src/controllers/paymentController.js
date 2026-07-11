const paymentService = require("../services/paymentService");
const receiptService = require("../services/receiptService");
const Payment = require("../models/Payment");
const Fine = require("../models/Fine");
const Member = require("../models/Member");

exports.processPayment = async (req, res) => {
  try {
    const { memberId, fineId, amount, paymentMethod, transactionId } = req.body;
    const payment = await paymentService.processFinePayment(
      req.user.libraryId, memberId, fineId, amount, paymentMethod, transactionId, req.user._id || req.user.id
    );
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const query = { libraryId: req.user.libraryId };
    if (req.query.memberId) query.memberId = req.query.memberId;
    if (req.query.status) query.status = req.query.status;

    const payments = await Payment.find(query)
      .populate("memberId", "firstName lastName memberCode")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, libraryId: req.user.libraryId })
      .populate("memberId", "firstName lastName memberCode email");
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    let fine = null;
    if (payment.purpose === "FINE") {
      fine = await Fine.findById(payment.referenceId);
    }

    const member = payment.memberId;
    const receipt = receiptService.buildReceiptData(payment, fine, member);

    res.status(200).json({ success: true, data: payment, receipt });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await paymentService.refundPayment(
      req.user.libraryId, req.params.id, reason, req.user._id || req.user.id
    );
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const mongoose = require('mongoose');

exports.getRevenueDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const matchQuery = { status: "SUCCESS" };
    const refundQuery = { status: "REFUNDED" };
    
    if (req.user.libraryId) {
      const libraryId = new mongoose.Types.ObjectId(req.user.libraryId);
      matchQuery.libraryId = libraryId;
      refundQuery.libraryId = libraryId;
    }

    const [todayRevenue, monthRevenue, totalRevenue, refundsCount] = await Promise.all([
      Payment.aggregate([{ $match: { ...matchQuery, createdAt: { $gte: startOfDay } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Payment.aggregate([{ $match: { ...matchQuery, createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Payment.aggregate([{ $match: matchQuery }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Payment.countDocuments(refundQuery)
    ]);

    res.status(200).json({
      success: true,
      data: {
        todayRevenue: todayRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        refundsCount
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
