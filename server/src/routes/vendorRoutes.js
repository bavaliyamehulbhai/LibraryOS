const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

router.get("/", checkPermission([PERMISSIONS.VENDOR_VIEW]), vendorController.getVendors);
router.get("/:id", checkPermission([PERMISSIONS.VENDOR_VIEW]), vendorController.getVendorDetails);
router.get("/:id/insights", checkPermission([PERMISSIONS.VENDOR_ANALYTICS]), vendorController.getVendorInsights);

module.exports = router;
