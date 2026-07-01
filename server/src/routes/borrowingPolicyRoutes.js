const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/borrowingPolicyController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.get("/dashboard", checkPermission("VIEW_CIRCULATION"), ctrl.getDashboard);
router.get("/check/:memberId", checkPermission("VIEW_CIRCULATION"), ctrl.checkMemberEligibility);
router.get("/policies", checkPermission("VIEW_CIRCULATION"), ctrl.getPolicies);
router.put("/policies/:planId", checkPermission("MANAGE_CIRCULATION"), ctrl.updatePolicy);

module.exports = router;
