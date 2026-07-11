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

    const total = await ResearchPaper.countDocuments({ libraryId: req.user.libraryId });
    if (total === 0 && !search && !type && !department) {
      const mockPapers = [
        {
          title: "Quantum Artificial Intelligence: A New Paradigm",
          abstract: "This paper explores the intersection of quantum computing and artificial intelligence, demonstrating exponential speedups in neural network training using quantum bits.",
          authors: ["Dr. Alan Turing", "Dr. Richard Feynman"],
          department: "Computer Science",
          researchType: "RESEARCH_PAPER",
          publicationYear: 2026,
          keywords: ["Quantum Computing", "AI", "Machine Learning"],
          fileUrl: "https://pdfobject.com/pdf/sample.pdf",
          status: "PUBLISHED",
          views: 342,
          libraryId: req.user.libraryId,
          uploadedBy: req.user._id
        },
        {
          title: "Sustainable Architecture in Urban Environments",
          abstract: "An analysis of zero-carbon footprint building designs in highly populated equatorial cities, focusing on natural ventilation and solar integration.",
          authors: ["Jane Smith, M.Arch"],
          department: "Architecture",
          researchType: "THESIS",
          publicationYear: 2025,
          keywords: ["Sustainability", "Urban Planning", "Zero-Carbon"],
          fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          status: "PUBLISHED",
          views: 128,
          libraryId: req.user.libraryId,
          uploadedBy: req.user._id
        },
        {
          title: "The Economic Impact of Universal Basic Income",
          abstract: "A comprehensive study on the effects of UBI trials across 5 countries, analyzing inflation rates, employment levels, and overall societal well-being.",
          authors: ["John Doe, Ph.D.", "Emily Chen"],
          department: "Economics",
          researchType: "DISSERTATION",
          publicationYear: 2024,
          keywords: ["UBI", "Economics", "Policy"],
          fileUrl: "https://pdfobject.com/pdf/sample.pdf",
          status: "PUBLISHED",
          views: 560,
          libraryId: req.user.libraryId,
          uploadedBy: req.user._id
        }
      ];
      await ResearchPaper.insertMany(mockPapers);
    }

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

exports.deleteResearch = async (req, res) => {
  try {
    const resourceId = req.params.id;
    
    // Build query based on role
    const query = { _id: resourceId };
    if (req.user.role !== "SUPER_ADMIN" && req.user.libraryId) {
      query.libraryId = req.user.libraryId;
    }

    const paper = await ResearchPaper.findOneAndDelete(query);
    
    if (!paper) {
      return res.status(404).json({ success: false, message: "Research not found or you don't have permission to delete it" });
    }
    
    res.json({ success: true, message: "Research deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
