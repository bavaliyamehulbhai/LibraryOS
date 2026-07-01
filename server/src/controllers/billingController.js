const billingService = require("../services/billingService");
const Invoice = require("../models/Invoice");
const PaymentTransaction = require("../models/PaymentTransaction");

exports.generateInvoice = async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;
    const invoice = await billingService.generateInvoice(req.libraryId, planId, billingCycle);
    
    res.status(201).json({
      success: true,
      message: "Invoice generated successfully",
      data: invoice
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const { invoiceId, paymentData } = req.body;
    const transaction = await billingService.recordPayment(invoiceId, paymentData);

    res.status(200).json({
      success: true,
      message: transaction.status === "SUCCESS" ? "Payment successful. Subscription activated." : "Payment failed",
      data: transaction
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ libraryId: req.libraryId })
      .populate('planId', 'planName planCode price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRevenueDashboard = async (req, res) => {
  try {
    // Usually restricted to SUPER_ADMIN
    const dashboardData = await billingService.calculateRevenue();
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findOne({ _id: invoiceId, libraryId: req.libraryId });
    
    if (!invoice || !invoice.pdfUrl) {
      return res.status(404).json({ success: false, message: "Invoice PDF not found" });
    }

    const path = require("path");
    const fs = require("fs");
    // e.g. /uploads/invoices/INV-123.pdf -> c:\...\uploads\invoices\INV-123.pdf
    const absolutePath = path.join(__dirname, "..", "..", invoice.pdfUrl);

    if (fs.existsSync(absolutePath)) {
      res.download(absolutePath); // This forces the browser to download the file
    } else {
      res.status(404).json({ success: false, message: "File not on disk" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInvoiceAnalytics = async (req, res) => {
  try {
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ status: "PAID" });
    const overdueInvoices = await Invoice.countDocuments({ status: "OVERDUE" });
    
    // Calculate total GST Collected (only for PAID invoices)
    const paidList = await Invoice.find({ status: "PAID" });
    const gstCollected = paidList.reduce((acc, curr) => acc + (curr.gst || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalInvoices,
        paidInvoices,
        overdueInvoices,
        gstCollected
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
