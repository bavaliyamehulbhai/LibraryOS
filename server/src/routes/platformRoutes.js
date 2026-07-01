const express = require("express");
const router = express.Router();
const { 
  getPlatformStats, 
  getTenants, 
  suspendTenant, 
  reactivateTenant 
} = require("../controllers/platformController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All routes here strictly require SUPER_ADMIN
router.use(authMiddleware);
router.use(roleMiddleware("SUPER_ADMIN"));

router.get("/stats", getPlatformStats);
router.get("/tenants", getTenants);
router.post("/tenants/:id/suspend", suspendTenant);
router.post("/tenants/:id/reactivate", reactivateTenant);

module.exports = router;
