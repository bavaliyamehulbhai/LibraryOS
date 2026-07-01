const superAdminService = require("../services/superAdminDashboardService");
const Library = require("../models/Library");
const Subscription = require("../models/Subscription");

exports.getDashboardData = async (req, res) => {
  try {
    const platformStats = await superAdminService.getPlatformStats();
    const revenueStats = await superAdminService.getRevenueStats();
    const trialStats = await superAdminService.getTrialStats();
    const healthStats = await superAdminService.getSystemHealth();

    res.status(200).json({
      success: true,
      data: {
        platformStats,
        revenueStats,
        trialStats,
        healthStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTenants = async (req, res) => {
  try {
    const libraries = await Library.find().sort({ createdAt: -1 });
    
    // Enrich with subscription data
    const enriched = await Promise.all(libraries.map(async (lib) => {
       const sub = await Subscription.findOne({ libraryId: lib._id }).populate("planId");
       return {
         _id: lib._id,
         name: lib.name,
         email: lib.email,
         phone: lib.phone,
         isActive: lib.isActive,
         createdAt: lib.createdAt,
         subscription: sub ? {
           planName: sub.planId ? sub.planId.planName : "Custom",
           status: sub.status
         } : null
       };
    }));

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleTenantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const library = await Library.findById(id);
    if (!library) return res.status(404).json({ success: false, message: "Library not found" });

    library.isActive = !library.isActive;
    await library.save();

    res.status(200).json({ success: true, message: `Library ${library.isActive ? 'activated' : 'suspended'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
