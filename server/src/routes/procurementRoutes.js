const express = require("express");
const router = express.Router();
const procurementController = require("../controllers/procurementController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

// Budget
router.get("/budget", checkPermission([PERMISSIONS.PROCUREMENT_VIEW]), procurementController.getBudget);

// Purchase Requests
router.post("/requests", checkPermission([PERMISSIONS.PROCUREMENT_REQUEST]), procurementController.submitRequest);
router.get("/requests", checkPermission([PERMISSIONS.PROCUREMENT_VIEW]), procurementController.getRequests);
router.put("/requests/:id/approve", checkPermission([PERMISSIONS.PROCUREMENT_APPROVE]), procurementController.approveRequest);

// Goods Receipt Note (GRN)
router.post("/grn", checkPermission([PERMISSIONS.PROCUREMENT_APPROVE]), procurementController.createGRN);
router.get("/grn", checkPermission([PERMISSIONS.PROCUREMENT_VIEW]), procurementController.getGRNs);

module.exports = router;
