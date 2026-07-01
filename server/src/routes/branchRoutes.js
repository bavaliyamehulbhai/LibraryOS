const express = require("express");
const router = express.Router();

const {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  restoreBranch,
  getBranchDashboard
} = require("../controllers/branchController");
const validate = require("../middleware/validate");
const { createBranchSchema, updateBranchSchema } = require("../validators/branchValidator");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// All branch routes require LIBRARY_ADMIN access
router.use(authMiddleware, authorize("LIBRARY_ADMIN", "SUPER_ADMIN"));

// Create Branch Route
router.post("/", validate(createBranchSchema), createBranch);

// Get All Branches
router.get("/", getBranches);

// Get Branch By ID
router.get("/:id", getBranchById);

// Get Branch Dashboard Stats
router.get("/:id/dashboard", getBranchDashboard);

// Update Branch
router.put("/:id", validate(updateBranchSchema), updateBranch);

// Soft Delete Branch
router.delete("/:id", deleteBranch);

// Restore Branch
router.patch("/:id/restore", restoreBranch);

module.exports = router;
