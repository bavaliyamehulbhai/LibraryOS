const trialService = require("../services/trialService");
const Trial = require("../models/Trial");
const TrialExtension = require("../models/TrialExtension");

exports.getStatus = async (req, res) => {
  try {
    const data = await trialService.getTrialStatus(req.libraryId);
    if (!data) return res.status(404).json({ success: false, message: "No trial found" });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.extendTrial = async (req, res) => {
  try {
    const { libraryId, daysAdded, reason } = req.body;
    // req.user._id is the Super Admin extending it
    const trial = await trialService.extendTrial(libraryId, daysAdded, req.user._id, reason);
    
    res.status(200).json({ success: true, message: "Trial extended successfully", data: trial });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.convertTrial = async (req, res) => {
  try {
    const trial = await trialService.convertTrial(req.libraryId);
    res.status(200).json({ success: true, message: "Trial converted to Paid", data: trial });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalTrials = await Trial.countDocuments();
    const activeTrials = await Trial.countDocuments({ status: "ACTIVE" });
    const expiredTrials = await Trial.countDocuments({ status: "EXPIRED" });
    const convertedTrials = await Trial.countDocuments({ status: "CONVERTED" });

    const conversionRate = totalTrials > 0 ? Math.round((convertedTrials / totalTrials) * 100) : 0;

    // Fetch top 10 leads (highest leadScore)
    const hotLeads = await Trial.find({ status: "ACTIVE" })
      .sort({ leadScore: -1 })
      .limit(10)
      .populate("libraryId", "name email phone");

    res.status(200).json({
      success: true,
      data: {
        totalTrials,
        activeTrials,
        expiredTrials,
        convertedTrials,
        conversionRate,
        hotLeads
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
