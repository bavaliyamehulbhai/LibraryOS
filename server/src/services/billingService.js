const Invoice = require("../models/Invoice");
const PaymentTransaction = require("../models/PaymentTransaction");
const Subscription = require("../models/Subscription");
const Plan = require("../models/Plan");
const Library = require("../models/Library");
const pdfGenerator = require("./pdfGenerator");
const crypto = require("crypto");

const GST_RATE = 0.18; // 18% GST for India

exports.generateInvoice = async (libraryId, planId, billingCycle = "MONTHLY", discountAmount = 0) => {
  const plan = await Plan.findById(planId);
  if (!plan) throw new Error("Plan not found");

  const amount = billingCycle === "YEARLY" ? plan.price * 10 : plan.price;
  
  // Apply discount BEFORE GST
  const subtotal = Math.max(0, amount - discountAmount);
  const gst = subtotal * GST_RATE;
  const totalAmount = subtotal + gst;

  const count = await Invoice.countDocuments();
  const year = new Date().getFullYear();
  const invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7); // 7 days to pay

  const subscription = await Subscription.findOne({ libraryId });

  const invoice = new Invoice({
    invoiceNumber,
    libraryId,
    subscriptionId: subscription._id,
    planId: plan._id,
    amount,
    discountAmount,
    gst,
    totalAmount,
    status: "PENDING",
    dueDate,
    billingCycle
  });

  await invoice.save();

  // Trigger PDF generation
  const library = await Library.findById(libraryId);
  if (library) {
    try {
      const pdfUrl = await pdfGenerator.generateInvoicePdf(invoice, library, plan);
      invoice.pdfUrl = pdfUrl;
      await invoice.save();
    } catch (err) {
      console.error("PDF Generation Failed:", err);
    }
  }

  return invoice;
};

exports.recordPayment = async (invoiceId, paymentData) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new Error("Invoice not found");

  // Create Transaction Record
  const transaction = new PaymentTransaction({
    transactionId: paymentData.transactionId || crypto.randomBytes(8).toString('hex'),
    invoiceId,
    libraryId: invoice.libraryId,
    amount: invoice.totalAmount,
    paymentMethod: paymentData.paymentMethod || "RAZORPAY",
    status: paymentData.status || "SUCCESS",
    paidAt: new Date(),
    gatewayResponse: paymentData.rawResponse
  });

  await transaction.save();

  if (transaction.status === "SUCCESS") {
    // Update Invoice
    invoice.status = "PAID";
    invoice.paidAt = new Date();
    await invoice.save();

    // Activate/Extend Subscription
    const subscription = await Subscription.findById(invoice.subscriptionId);
    subscription.planId = invoice.planId;
    subscription.status = "ACTIVE";
    
    const expiry = new Date();
    if (invoice.billingCycle === "YEARLY") expiry.setFullYear(expiry.getFullYear() + 1);
    else expiry.setMonth(expiry.getMonth() + 1); // Default Monthly
    
    subscription.expiryDate = expiry;
    await subscription.save();
  }

  return transaction;
};

exports.calculateRevenue = async () => {
  // Aggregate total MRR and ARR
  const currentMonth = new Date();
  currentMonth.setDate(1); // Start of month

  const revenueData = await Invoice.aggregate([
    { $match: { status: "PAID" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" }, // Exclude GST from pure revenue
        totalGSTCollected: { $sum: "$gst" }
      }
    }
  ]);

  const recentTransactions = await PaymentTransaction.find({ status: "SUCCESS" })
    .sort({ paidAt: -1 })
    .limit(10)
    .populate('libraryId', 'name email');

  return {
    metrics: revenueData[0] || { totalRevenue: 0, totalGSTCollected: 0 },
    recentTransactions
  };
};
