const ResearchPaper = require("../models/ResearchPaper");
const researchService = require("../services/researchService");

exports.uploadResearch = async (req, res) => {
  try {
    const paper = new ResearchPaper({
      ...req.body,
      uploadedBy: req.user._id,
      libraryId: req.user.libraryId
    });
    
    // Parse comma separated strings from form data
    if (typeof req.body.authors === 'string') {
      paper.authors = req.body.authors.split(',').map(s => s.trim());
    }
    if (typeof req.body.keywords === 'string') {
      paper.keywords = req.body.keywords.split(',').map(s => s.trim());
    }

    await paper.save();
    res.status(201).json({ success: true, data: paper, message: "Research uploaded successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getResearchList = async (req, res) => {
  try {
    const { search, type, department } = req.query;
    let query = { libraryId: req.user.libraryId, status: "PUBLISHED" };

    if (search) {
      query.$text = { $search: search };
    }
    if (type) query.researchType = type;
    if (department) query.department = department;

    const papers = await ResearchPaper.find(query)
      .populate("uploadedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: papers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getResearchById = async (req, res) => {
  try {
    const paper = await ResearchPaper.findById(req.params.id)
      .populate("uploadedBy", "firstName lastName");
      
    if (!paper) return res.status(404).json({ success: false, message: "Not found" });
    
    // Increment view
    paper.views += 1;
    await paper.save();

    res.json({ success: true, data: paper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAiSummary = async (req, res) => {
  try {
    const paper = await ResearchPaper.findById(req.params.id);
    if (!paper) return res.status(404).json({ success: false, message: "Not found" });
    
    const summary = await researchService.aiSummarize(paper.abstract);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateCitation = async (req, res) => {
  try {
    const { format } = req.body;
    const paper = await ResearchPaper.findById(req.params.id);
    if (!paper) return res.status(404).json({ success: false, message: "Not found" });
    
    const citation = await researchService.aiGenerateCitation(paper, format);
    res.json({ success: true, data: citation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
