const express = require("express");
const router = express.Router();

const {
  createLibrary,
  getLibraries,
  getLibraryById,
  updateLibrary,
  deleteLibrary,
  restoreLibrary
} = require("../controllers/libraryController");
const validate = require("../middleware/validate");
const { createLibrarySchema } = require("../validators/libraryValidator");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Public Route for Library Onboarding
router.post("/", validate(createLibrarySchema), createLibrary);

// All other library routes require SUPER_ADMIN access
router.use(authMiddleware, authorize("SUPER_ADMIN"));

// Get All Libraries (with pagination, search, filters)
router.get("/", getLibraries);

// Get Library By ID
router.get("/:id", getLibraryById);

// Update Library
router.put("/:id", updateLibrary);

// Soft Delete Library
router.delete("/:id", deleteLibrary);

// Restore Library
router.patch("/:id/restore", restoreLibrary);

module.exports = router;
