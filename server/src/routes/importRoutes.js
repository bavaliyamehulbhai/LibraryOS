const express = require("express");
const router = express.Router();
const importController = require("../controllers/importController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const upload = require("../middleware/upload");

router.use(authMiddleware);

router.post("/import", checkPermission("BOOK_IMPORT"), upload.single("file"), importController.uploadFile);
router.get("/import-template", checkPermission("BOOK_IMPORT"), importController.downloadTemplate);
router.get("/:jobId/progress", checkPermission("BOOK_IMPORT_VIEW"), importController.getProgress);
router.get("/history", checkPermission("BOOK_IMPORT_VIEW"), importController.getHistory);
router.get("/:jobId/errors", checkPermission("BOOK_IMPORT_DOWNLOAD"), importController.getErrors);
router.get("/stats", checkPermission("BOOK_IMPORT_VIEW"), importController.getStats);

module.exports = router;
