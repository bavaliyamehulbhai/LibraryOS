const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdminController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// All routes require SUPER_ADMIN
router.use(authMiddleware);
router.use(checkPermission("SUPER_ADMIN"));

router.get("/dashboard", superAdminController.getDashboardData);
router.get("/tenants", superAdminController.getTenants);
router.put("/tenants/:id/toggle", superAdminController.toggleTenantStatus);

module.exports = router;
