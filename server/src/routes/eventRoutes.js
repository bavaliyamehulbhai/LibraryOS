const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

// Public (Member) Routes
router.get("/", checkPermission([PERMISSIONS.EVENT_VIEW]), eventController.getEvents);
router.post("/:id/register", checkPermission([PERMISSIONS.EVENT_VIEW]), eventController.registerForEvent);

// Admin Routes
router.post("/", checkPermission([PERMISSIONS.EVENT_CREATE]), eventController.createEvent);
router.get("/:id/registrations", checkPermission([PERMISSIONS.EVENT_MANAGE]), eventController.getRegistrations);
router.put("/registrations/:regId/attendance", checkPermission([PERMISSIONS.EVENT_MANAGE]), eventController.markAttendance);
router.post("/ai-generate", checkPermission([PERMISSIONS.EVENT_CREATE]), eventController.generateAIIdea);

module.exports = router;
