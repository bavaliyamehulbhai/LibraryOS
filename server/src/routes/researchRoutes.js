const express = require("express");
const router = express.Router();
const researchController = require("../controllers/researchController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

router.post("/", checkPermission([PERMISSIONS.RESEARCH_UPLOAD]), researchController.uploadResearch);
router.get("/", checkPermission([PERMISSIONS.RESEARCH_VIEW]), researchController.getResearchList);
router.get("/:id", checkPermission([PERMISSIONS.RESEARCH_VIEW]), researchController.getResearchById);
router.get("/:id/ai-summary", checkPermission([PERMISSIONS.RESEARCH_VIEW]), researchController.getAiSummary);
router.post("/:id/citation", checkPermission([PERMISSIONS.RESEARCH_VIEW]), researchController.generateCitation);

module.exports = router;
