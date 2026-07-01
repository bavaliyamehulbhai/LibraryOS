const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Public route to view pricing
router.get("/plans", subscriptionController.getPlans);

// Protected routes
router.use(authMiddleware);

router.get("/current", checkPermission("PLAN_VIEW"), subscriptionController.getCurrentSubscription);
router.post("/upgrade", checkPermission("PLAN_MANAGE"), subscriptionController.upgradePlan);
router.post("/downgrade", checkPermission("PLAN_MANAGE"), subscriptionController.downgradePlan);
router.post("/cancel", checkPermission("PLAN_MANAGE"), subscriptionController.cancelPlan);

module.exports = router;
