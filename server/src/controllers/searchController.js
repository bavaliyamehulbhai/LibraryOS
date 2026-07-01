const searchService = require("../services/searchService");

exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Query string required" });

    const results = await searchService.globalSearch(q, req.user.libraryId);
    
    // Log search
    const totalResults = results.books.length + results.research.length;
    await searchService.logSearch(q, req.user.libraryId, req.user._id, "EXACT", totalResults);

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.semanticSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Query string required" });

    const results = await searchService.semanticSearch(q, req.user.libraryId);
    
    // Log search
    const totalResults = results.books.length + results.research.length;
    await searchService.logSearch(q, req.user.libraryId, req.user._id, "SEMANTIC", totalResults, results.keywords);

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const data = await searchService.getAnalytics(req.user.libraryId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
