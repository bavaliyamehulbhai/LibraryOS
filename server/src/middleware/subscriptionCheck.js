const Organization = require("../models/Organization");
const Book = require("../models/Book");
const User = require("../models/User");

// Usage example:
// router.post("/", subscriptionCheck("books"), bookController.createBook);
const subscriptionCheck = (resourceType) => {
  return async (req, res, next) => {
    try {
      const tenant = req.tenant; // from tenantMiddleware
      if (!tenant) {
        return res.status(403).json({ success: false, message: "Tenant not found in request" });
      }

      // Hardcoded limits for MVP phase (Phase 1) before Razorpay is fully integrated
      let maxMembers = 500;
      let maxBooks = 5000;
      const planName = tenant.subscriptionId ? "PROFESSIONAL" : "STARTER"; // Mock logic until Subscription model fully populated

      if (planName === "PROFESSIONAL") {
        maxMembers = 5000;
        maxBooks = 50000;
      } else if (planName === "ENTERPRISE") {
        maxMembers = Infinity;
        maxBooks = Infinity;
      }

      if (resourceType === "members") {
        const memberCount = await User.countDocuments({ libraryId: req.libraryId, role: "MEMBER" });
        if (memberCount >= maxMembers) {
          return res.status(403).json({ 
            success: false, 
            message: `Plan limit reached. You can only have ${maxMembers} members on your current plan. Please upgrade.` 
          });
        }
      }

      if (resourceType === "books") {
        const bookCount = await Book.countDocuments({ libraryId: req.libraryId });
        if (bookCount >= maxBooks) {
          return res.status(403).json({ 
            success: false, 
            message: `Plan limit reached. You can only have ${maxBooks} books on your current plan. Please upgrade.` 
          });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

module.exports = subscriptionCheck;
