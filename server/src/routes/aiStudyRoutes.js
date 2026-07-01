const express = require("express");
const router = express.Router();
const aiStudyController = require("../controllers/aiStudyController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

router.get("/progress", checkPermission([PERMISSIONS.AI_STUDY_ACCESS]), aiStudyController.getProgress);
router.post("/generate", checkPermission([PERMISSIONS.AI_STUDY_ACCESS]), aiStudyController.generate);

module.exports = router;
