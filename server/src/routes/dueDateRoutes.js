const express = require("express");
const router = express.Router();
const dueDateController = require("../controllers/dueDateController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.get("/dashboard", checkPermission("MANAGE_TRANSACTIONS"), dueDateController.getDashboard);
router.get("/overdue", checkPermission("MANAGE_TRANSACTIONS"), dueDateController.getOverdueBooks);
router.get("/reminders", checkPermission("MANAGE_TRANSACTIONS"), dueDateController.getReminderHistory);

module.exports = router;
