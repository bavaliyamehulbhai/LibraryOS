const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");

// PUBLIC ROUTES - NO AUTH MIDDLEWARE
router.get("/books", publicController.getPublicCatalog);
router.get("/books/search", publicController.searchPublicCatalog);
router.get("/books/:id", publicController.getPublicBookDetails);
router.get("/categories", publicController.getPublicCategories);
router.get("/stats", publicController.getLibraryStats);
router.get("/libraries", publicController.getLibraries);

const seedBooks = require("../seeders/bookSeeder");
router.get("/seed-books", async (req, res) => {
  try {
    const result = await seedBooks();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
