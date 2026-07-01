const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.post("/", checkPermission("MANAGE_CIRCULATION"), paymentController.processPayment);
router.get("/", checkPermission("VIEW_CIRCULATION"), paymentController.getPayments);
router.get("/dashboard", checkPermission("VIEW_CIRCULATION"), paymentController.getRevenueDashboard);
router.get("/:id", checkPermission("VIEW_CIRCULATION"), paymentController.getPaymentById);
router.post("/:id/refund", checkPermission("MANAGE_CIRCULATION"), paymentController.refundPayment);

module.exports = router;
