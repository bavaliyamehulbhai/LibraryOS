const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

// Base middleware
router.use(authMiddleware);

// Public Kiosk Route (Requires ATTENDANCE_MANAGE or KIOSK mode auth, for now we will just use basic auth for simplicity)
// To keep it simple, the Kiosk page will be logged in as an Admin/Librarian.
router.post("/punch", checkPermission([PERMISSIONS.ATTENDANCE_MANAGE]), attendanceController.punch);

// Dashboard routes
router.get("/active", checkPermission([PERMISSIONS.ATTENDANCE_VIEW]), attendanceController.getActive);
router.post("/visitor", checkPermission([PERMISSIONS.ATTENDANCE_MANAGE]), attendanceController.registerVisitor);
router.post("/visitor/:id/out", checkPermission([PERMISSIONS.ATTENDANCE_MANAGE]), attendanceController.punchOutVisitor);

module.exports = router;
