const express = require("express");
const router = express.Router();
const academicController = require("../controllers/academicController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// All academic integration routes require authentication
router.use(authMiddleware);

// Fetch Crossref metadata
router.post("/crossref", academicController.fetchCrossrefMetadata);

// Get BibTeX citation format for a paper
router.get("/:id/bibtex", academicController.generateBibtex);

module.exports = router;
