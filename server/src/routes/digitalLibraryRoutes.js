const express = require("express");
const router = express.Router();
const digitalLibraryController = require("../controllers/digitalLibraryController");
const storageService = require("../services/storageService");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

// Upload requires RESOURCE_UPLOAD permission
router.post("/upload", checkPermission([PERMISSIONS.RESOURCE_UPLOAD]), storageService.uploadMiddleware, digitalLibraryController.uploadResource);

// Viewing/Searching requires RESOURCE_VIEW
router.get("/", checkPermission([PERMISSIONS.RESOURCE_VIEW]), digitalLibraryController.getAllResources);
router.get("/my-library", checkPermission([PERMISSIONS.RESOURCE_VIEW]), digitalLibraryController.getMyLibrary);
router.delete("/my-library/:id", checkPermission([PERMISSIONS.RESOURCE_VIEW]), digitalLibraryController.removeFromMyLibrary);
router.post("/:id/save", checkPermission([PERMISSIONS.RESOURCE_VIEW]), digitalLibraryController.toggleSaveForLater);
router.get("/:id", checkPermission([PERMISSIONS.RESOURCE_VIEW]), digitalLibraryController.getResourceDetails);
router.delete("/:id", checkPermission([PERMISSIONS.RESOURCE_DELETE]), digitalLibraryController.deleteResource);

// Progress tracking
router.post("/progress", checkPermission([PERMISSIONS.RESOURCE_VIEW]), digitalLibraryController.updateReadingProgress);

module.exports = router;
