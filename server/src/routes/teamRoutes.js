const express = require("express");
const router = express.Router();
const { getTeams, createTeam } = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.get("/", checkPermission("TEAMS_VIEW"), getTeams);
router.post("/", checkPermission("TEAMS_CREATE"), createTeam);

module.exports = router;
