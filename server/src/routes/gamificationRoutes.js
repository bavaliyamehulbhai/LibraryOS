const express = require("express");
const router = express.Router();
const gamificationController = require("../controllers/gamificationController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

router.get("/profile", checkPermission([PERMISSIONS.GAMIFICATION_ACCESS]), gamificationController.getProfile);
router.get("/leaderboard", checkPermission([PERMISSIONS.GAMIFICATION_ACCESS]), gamificationController.getLeaderboard);
router.post("/simulate", checkPermission([PERMISSIONS.GAMIFICATION_ACCESS]), gamificationController.simulateAction);

module.exports = router;
