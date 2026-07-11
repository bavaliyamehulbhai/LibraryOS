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

exports.quickSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Query string required" });
    const results = await searchService.quickSearch(q, req.user.libraryId);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bookSearch = async (req, res) => {
  try {
    const { q, category, author, publisher } = req.query;
    const results = await searchService.bookSearch({ q, category, author, publisher }, req.user.libraryId);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.authorSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const results = await searchService.authorSearch(q, req.user.libraryId);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.publisherSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const results = await searchService.publisherSearch(q, req.user.libraryId);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.copySearch = async (req, res) => {
  try {
    const { q } = req.query;
    const results = await searchService.copySearch(q, req.user.libraryId);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.shelfSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const results = await searchService.shelfSearch(q, req.user.libraryId);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Query string required" });
    const suggestions = await searchService.getSuggestions(q, req.user.libraryId);
    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
