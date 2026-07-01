const Plan = require("../models/Plan");
const Subscription = require("../models/Subscription");
const UsageTracking = require("../models/UsageTracking");
const subscriptionService = require("../services/subscriptionService");

exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ status: "ACTIVE" }).sort({ price: 1 });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      libraryId: req.user.libraryId 
    }).populate('planId');

    const usage = await UsageTracking.findOne({ libraryId: req.user.libraryId });

    res.json({ 
      success: true, 
      data: { 
        subscription, 
        usage 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.upgradePlan = async (req, res) => {
  try {
    const { planCode } = req.body;
    
    // In Phase 5, we'll verify payment intent here before upgrading
    const subscription = await subscriptionService.upgradePlan(req.user.libraryId, planCode);
    
    res.json({ 
      success: true, 
      message: `Successfully upgraded to ${planCode}`,
      data: subscription 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.downgradePlan = async (req, res) => {
  try {
    const { planCode } = req.body;
    const subscription = await subscriptionService.downgradePlan(req.user.libraryId, planCode);
    
    res.json({ 
      success: true, 
      message: `Successfully downgraded to ${planCode}`,
      data: subscription 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.cancelPlan = async (req, res) => {
  try {
    const subscription = await subscriptionService.cancelPlan(req.user.libraryId);
    
    res.json({ 
      success: true, 
      message: "Subscription cancelled successfully",
      data: subscription 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
