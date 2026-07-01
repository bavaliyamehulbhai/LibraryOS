const express = require("express");
const router = express.Router();
const planController = require("../controllers/membershipPlanController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.get("/analytics", checkPermission("MANAGE_MEMBERS"), planController.getAnalytics);
router.get("/", checkPermission("VIEW_MEMBERS"), planController.getPlans);
router.post("/", checkPermission("MANAGE_MEMBERS"), planController.createPlan);
router.get("/:id", checkPermission("VIEW_MEMBERS"), planController.getPlanById);
router.put("/:id", checkPermission("MANAGE_MEMBERS"), planController.updatePlan);
router.delete("/:id", checkPermission("MANAGE_MEMBERS"), planController.deletePlan);

// We keep the assign plan here for administrative routing, but it operates on memberId
router.put("/members/:memberId/assign-plan", checkPermission("MANAGE_MEMBERS"), planController.assignPlan);

module.exports = router;
