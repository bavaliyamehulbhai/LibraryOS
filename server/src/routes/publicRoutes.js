const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");

// PUBLIC ROUTES - NO AUTH MIDDLEWARE
router.get("/books", publicController.getPublicCatalog);
router.get("/books/search", publicController.searchPublicCatalog);
router.get("/books/:id", publicController.getPublicBookDetails);
router.get("/stats", publicController.getLibraryStats);
router.get("/libraries", publicController.getLibraries);

module.exports = router;
