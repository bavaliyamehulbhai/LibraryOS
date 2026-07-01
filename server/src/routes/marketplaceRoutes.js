const express = require("express");
const router = express.Router();
const marketplaceController = require("../controllers/marketplaceController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.post("/seed", marketplaceController.seedData); // Temp for testing

router.use(authMiddleware);

// Buyers (Libraries)
router.get("/books", checkPermission([PERMISSIONS.MARKETPLACE_VIEW]), marketplaceController.getBooks);
router.get("/books/:id", checkPermission([PERMISSIONS.MARKETPLACE_VIEW]), marketplaceController.getBookDetails);
router.post("/order", checkPermission([PERMISSIONS.MARKETPLACE_BUY]), marketplaceController.placeOrder);
router.get("/orders", checkPermission([PERMISSIONS.MARKETPLACE_VIEW]), marketplaceController.getOrders);

module.exports = router;
