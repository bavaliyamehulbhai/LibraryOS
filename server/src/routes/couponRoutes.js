const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

// Tenant routes
router.post("/apply", checkPermission("MANAGE_SETTINGS"), couponController.applyCoupon);

// Super Admin routes
router.post("/", checkPermission("SUPER_ADMIN"), couponController.createCoupon);
router.get("/", checkPermission("SUPER_ADMIN"), couponController.getCoupons);
router.delete("/:id", checkPermission("SUPER_ADMIN"), couponController.deleteCoupon);

module.exports = router;
