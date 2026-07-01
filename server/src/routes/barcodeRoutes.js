const express = require("express");
const router = express.Router();
const barcodeController = require("../controllers/barcodeController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

// Generation
router.post("/generate", checkPermission("BARCODE_GENERATE"), barcodeController.generateSingle);
router.post("/generate-bulk", checkPermission("BARCODE_GENERATE"), barcodeController.generateBulkForBook);

// Printing
router.post("/print-data", checkPermission("BARCODE_PRINT"), barcodeController.getPrintData);

// Scanning
router.post("/scan", checkPermission("BARCODE_SCAN"), barcodeController.scanBarcode);

// Analytics
router.get("/stats", checkPermission("BARCODE_VIEW"), barcodeController.getStats);

module.exports = router;
