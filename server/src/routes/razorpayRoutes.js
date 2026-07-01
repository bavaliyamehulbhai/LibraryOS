const express = require("express");
const router = express.Router();
const rzpController = require("../controllers/razorpayController");
const authMiddleware = require("../middleware/authMiddleware");

// Public webhook route (Razorpay server calls this directly, no auth token)
router.post("/webhooks/razorpay", express.json({ type: "application/json" }), rzpController.handleWebhook);

// Protected routes
router.use(authMiddleware);

router.post("/subscriptions/create", rzpController.createSubscription);
router.post("/subscriptions/verify", rzpController.verifyPayment);
router.put("/subscriptions/cancel", rzpController.cancelSubscription);

router.post("/fines/create-order", rzpController.createFineOrder);
router.post("/fines/verify", rzpController.verifyFinePayment);

module.exports = router;
