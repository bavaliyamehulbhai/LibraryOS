const Library = require("../models/Library");
const Subscription = require("../models/Subscription");

/**
 * Calculates current platform revenue based on active subscriptions
 */
const calculateCurrentRevenue = async () => {
  try {
    // Basic implementation: Find all active libraries and sum up their subscription costs
    const activeLibraries = await Library.find({ status: "ACTIVE" }).populate("subscriptionId").lean();
    
    let totalRevenue = 0;
    
    activeLibraries.forEach(lib => {
      if (lib.subscriptionId && lib.subscriptionId.monthlyPrice) {
        totalRevenue += lib.subscriptionId.monthlyPrice;
      }
    });

    return totalRevenue;
  } catch (error) {
    console.error("Error calculating revenue:", error);
    return 0;
  }
};

module.exports = {
  calculateCurrentRevenue
};
