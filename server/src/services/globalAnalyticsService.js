const Library = require("../models/Library");
const Subscription = require("../models/Subscription");
const PaymentTransaction = require("../models/PaymentTransaction");
const User = require("../models/User");
const Ticket = require("../models/Ticket");

exports.getGlobalOverview = async () => {
  // 1. Tenant Metrics
  const totalLibraries = await Library.countDocuments();
  const activeLibraries = await Library.countDocuments({ status: "ACTIVE" });
  const trialLibraries = await Library.countDocuments({ status: "TRIAL" });
  const suspendedLibraries = await Library.countDocuments({ status: "SUSPENDED" });

  // 2. Revenue & Subscription Metrics
  // Since we don't have historical ARR in a single field, we'll approximate based on Active Subscriptions
  const activeSubscriptions = await Subscription.find({ status: "ACTIVE" }).populate("planId");
  
  let mrr = 0;
  let activeSubsCount = 0;
  
  activeSubscriptions.forEach(sub => {
    if (sub.planId && sub.planId.price > 0) {
      activeSubsCount++;
      // If plan is monthly, add price. If annual, divide by 12.
      const billingCycle = sub.planId.billingCycle || 'MONTHLY'; // Fallback
      if (billingCycle === 'YEARLY') {
        mrr += (sub.planId.price / 12);
      } else {
        mrr += sub.planId.price;
      }
    }
  });

  const arr = mrr * 12;

  // 3. Gross Revenue (Total successful payments)
  const allPayments = await PaymentTransaction.aggregate([
    { $match: { status: "SUCCESS" } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
  ]);
  const totalGrossRevenue = allPayments.length > 0 ? allPayments[0].totalRevenue : 0;

  // 4. Churn & LTV (Approximations)
  const cancelledSubs = await Subscription.countDocuments({ status: "CANCELLED" });
  const totalSubsEver = await Subscription.countDocuments();
  const churnRate = totalSubsEver > 0 ? (cancelledSubs / totalSubsEver) * 100 : 0;

  const arpu = activeLibraries > 0 ? (mrr / activeLibraries) : 0;
  const retentionRate = 100 - churnRate;
  // Simple LTV proxy: ARPU * (1 / ChurnRate(as decimal)) or just a rough multiplier if churn is 0
  const ltv = churnRate > 0 ? (arpu / (churnRate / 100)) : arpu * 12; // Assuming 1 year retention if no churn
  const cac = 1500; // Mocked CAC since we have no marketing spend data

  // 5. Support Metrics
  const openTickets = await Ticket.countDocuments({ status: { $in: ["OPEN", "IN_PROGRESS"] } });
  const resolvedTickets = await Ticket.countDocuments({ status: "RESOLVED" });

  // Calculate Business Health Score (0-100)
  let healthScore = 100;
  if (churnRate > 10) healthScore -= 20;
  if (churnRate > 5 && churnRate <= 10) healthScore -= 10;
  if (openTickets > 50) healthScore -= 10;
  if (mrr === 0) healthScore -= 30; // New business

  return {
    tenants: {
      total: totalLibraries,
      active: activeLibraries,
      trial: trialLibraries,
      suspended: suspendedLibraries
    },
    revenue: {
      mrr: Math.round(mrr),
      arr: Math.round(arr),
      totalGross: totalGrossRevenue,
      arpu: Math.round(arpu)
    },
    growth: {
      churnRate: churnRate.toFixed(1),
      ltv: Math.round(ltv),
      cac: cac,
      totalActiveSubscriptions: activeSubsCount
    },
    support: {
      openTickets,
      resolvedTickets
    },
    businessHealth: Math.max(0, healthScore)
  };
};

exports.getRevenueTrend = async () => {
  const PaymentTransaction = require("../models/PaymentTransaction");
  
  // Get revenue grouped by month for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1); // Start of that month

  const transactions = await PaymentTransaction.aggregate([
    { 
      $match: { 
        status: "SUCCESS",
        createdAt: { $gte: sixMonthsAgo } 
      } 
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$amount" }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIndex = new Date().getMonth();
  
  // Create an array of the last 6 months
  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    let d = new Date();
    d.setMonth(currentMonthIndex - i);
    const monthIndex = d.getMonth();
    
    // Find if we have revenue for this month
    const found = transactions.find(t => t._id === monthIndex + 1);
    
    trendData.push({
      name: months[monthIndex],
      revenue: found ? found.revenue : 0,
      mrr: found ? Math.round(found.revenue / 12) : 0 // rough proxy if mostly annual, or just use revenue
    });
  }
  
  return trendData;
};

exports.getPlanDistribution = async () => {
  const Subscription = require("../models/Subscription");
  
  const distribution = await Subscription.aggregate([
    { $match: { status: "ACTIVE" } },
    {
      $lookup: {
        from: "plans",
        localField: "planId",
        foreignField: "_id",
        as: "planDetails"
      }
    },
    { $unwind: "$planDetails" },
    {
      $group: {
        _id: "$planDetails.planName",
        value: { $sum: 1 }
      }
    },
    { $project: { _id: 0, name: "$_id", value: 1 } }
  ]);
  
  // If no data, return a default so the chart doesn't break
  if (distribution.length === 0) {
    return [
      { name: "No Active Subscriptions", value: 1 }
    ];
  }

  return distribution;
};
