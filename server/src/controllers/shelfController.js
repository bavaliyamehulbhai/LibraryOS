const shelfService = require("../services/shelfService");
const cache = require("../utils/cache");

exports.createShelf = async (req, res) => {
  try {
    const shelfData = { ...req.body, libraryId: req.user.libraryId };
    const shelf = await shelfService.createShelf(shelfData);
    await cache.del(`shelves:${req.user.libraryId}`);
    await cache.del(`shelf_analytics:${req.user.libraryId}`);
    res.status(201).json({ success: true, data: shelf, message: "Shelf created successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Shelf code already exists in this library" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getShelves = async (req, res) => {
  try {
    const cacheKey = `shelves:${req.user.libraryId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    const shelves = await shelfService.getShelves(req.user.libraryId);
    await cache.set(cacheKey, shelves, 60);
    res.json({ success: true, data: shelves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const cacheKey = `shelf_analytics:${req.user.libraryId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    const analytics = await shelfService.getAnalytics(req.user.libraryId);
    await cache.set(cacheKey, analytics, 60);
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.recommendShelf = async (req, res) => {
  try {
    const { category, copies = 1 } = req.body;
    if (!category) return res.status(400).json({ success: false, message: "Category is required" });
    
    const recommendation = await shelfService.recommendShelf(req.user.libraryId, category, copies);
    res.json({ success: true, data: recommendation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.aiAssistant = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: "Query is required" });
    
    const response = await shelfService.aiAssistant(req.user.libraryId, query);
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
