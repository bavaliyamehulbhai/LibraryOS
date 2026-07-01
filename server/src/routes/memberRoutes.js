const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.get("/analytics", checkPermission("MANAGE_MEMBERS"), memberController.getAnalytics);
router.get("/", checkPermission("VIEW_MEMBERS"), memberController.getAllMembers);
router.post("/", checkPermission("MANAGE_MEMBERS"), memberController.registerMember);
router.get("/:id", checkPermission("VIEW_MEMBERS"), memberController.getMemberById);
router.put("/:id", checkPermission("MANAGE_MEMBERS"), memberController.updateMember);
router.get("/:id/history", checkPermission("VIEW_MEMBERS"), memberController.getMemberHistory);

// Action routes
router.put("/:id/status", checkPermission("MANAGE_MEMBERS"), memberController.updateStatus);
router.put("/:id/verify", checkPermission("MANAGE_MEMBERS"), memberController.verifyMember);

module.exports = router;
