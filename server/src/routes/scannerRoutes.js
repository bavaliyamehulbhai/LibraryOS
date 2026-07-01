const express = require("express");
const router = express.Router();
const scannerController = require("../controllers/scannerController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

router.post("/isbn", checkPermission([PERMISSIONS.SCAN_BOOK]), scannerController.scanISBN);
router.get("/history", checkPermission([PERMISSIONS.SCAN_BOOK]), scannerController.getScanHistory);

module.exports = router;
