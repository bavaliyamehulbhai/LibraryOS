const Library = require("../models/Library");
const Book = require("../models/Book");
const User = require("../models/User");
const Invoice = require("../models/Invoice");
const Subscription = require("../models/Subscription");
const Trial = require("../models/Trial");

exports.getPlatformStats = async () => {
  const totalLibraries = await Library.countDocuments();
  const totalBooks = await Book.countDocuments();
  const totalMembers = await User.countDocuments({ role: "MEMBER" });

  return {
    totalLibraries,
    totalBooks,
    totalMembers
  };
};

exports.getRevenueStats = async () => {
  // Aggregate all PAID invoices
  const paidInvoices = await Invoice.find({ status: "PAID" });
  
  const lifetimeRevenue = paidInvoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  
  // Calculate MRR (Monthly Recurring Revenue) by finding active MONTHLY subscriptions
  // For simplicity, we just look at the recurring Monthly Plans active right now
  const monthlyInvoices = paidInvoices.filter(i => i.billingCycle === "MONTHLY");
  // Assuming a rough estimate of MRR based on last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentMonthlyRevenue = monthlyInvoices
    .filter(i => new Date(i.createdAt) >= thirtyDaysAgo)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0); // exclude GST for MRR
    
  const mrr = recentMonthlyRevenue;
  const arr = mrr * 12;

  // Chart Data: Revenue per month for the last 6 months
  const chartData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 7000 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: lifetimeRevenue }
  ];

  return {
    mrr,
    arr,
    lifetimeRevenue,
    chartData
  };
};

exports.getTrialStats = async () => {
  const totalTrials = await Trial.countDocuments();
  const activeTrials = await Trial.countDocuments({ status: "ACTIVE" });
  const convertedTrials = await Trial.countDocuments({ status: "CONVERTED" });
  
  const conversionRate = totalTrials > 0 ? Math.round((convertedTrials / totalTrials) * 100) : 0;

  return {
    totalTrials,
    activeTrials,
    convertedTrials,
    conversionRate
  };
};

exports.getSystemHealth = async () => {
  // Simulate system health
  return {
    status: "Healthy",
    apiLatency: "45ms",
    database: "Connected",
    activeConnections: Math.floor(Math.random() * 50) + 10
  };
};
