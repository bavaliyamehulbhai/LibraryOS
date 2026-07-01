const express = require("express");
const router = express.Router();
const exportController = require("../controllers/exportController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.post("/", checkPermission("BOOK_EXPORT"), exportController.requestExport);
router.get("/:jobId/progress", checkPermission("BOOK_EXPORT_VIEW"), exportController.getProgress);
router.get("/download/:jobId", checkPermission("BOOK_EXPORT_DOWNLOAD"), exportController.downloadExport);
router.get("/history", checkPermission("BOOK_EXPORT_VIEW"), exportController.getHistory);
router.get("/stats", checkPermission("BOOK_EXPORT_VIEW"), exportController.getStats);

// Scheduled Exports
router.post("/scheduled", checkPermission("BOOK_EXPORT"), exportController.scheduleExport);
router.get("/scheduled", checkPermission("BOOK_EXPORT_VIEW"), exportController.getScheduledExports);

module.exports = router;
