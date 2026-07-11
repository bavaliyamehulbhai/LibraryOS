const express = require("express");
const router = express.Router();
const qrController = require("../controllers/qrController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Public route for scanning details
router.get("/:copyId", qrController.getQRData);

// Protected routes
router.use(authMiddleware);
router.post("/generate", checkPermission("QR_GENERATE"), qrController.generateSingle);
router.post("/generate-bulk", checkPermission("QR_GENERATE"), qrController.generateBulk);
router.post("/scan", checkPermission("QR_SCAN"), qrController.scanQR);
router.post("/self-checkout", qrController.selfCheckout); // Accessible by any logged in user
router.post("/self-return", qrController.selfReturn); // Accessible by any logged in user
router.get("/stats", checkPermission("QR_VIEW"), qrController.getStats);

module.exports = router;
