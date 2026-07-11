const express = require("express");
const router = express.Router();
const readerController = require("../controllers/readerController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

router.post("/notes", checkPermission([PERMISSIONS.NOTE_CREATE]), readerController.addNote);
router.get("/notes/:resourceId", checkPermission([PERMISSIONS.RESOURCE_VIEW]), readerController.getNotes);

router.post("/bookmark", checkPermission([PERMISSIONS.RESOURCE_VIEW]), readerController.toggleBookmark);

// AI Assistant Endpoints
router.post("/ai/explain", checkPermission([PERMISSIONS.RESOURCE_VIEW]), readerController.explainConcept);
router.post("/ai/summarize", checkPermission([PERMISSIONS.RESOURCE_VIEW]), readerController.summarizeChapter);
router.post("/ai/chat", checkPermission([PERMISSIONS.RESOURCE_VIEW]), readerController.askChat);

module.exports = router;
