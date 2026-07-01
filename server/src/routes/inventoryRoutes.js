const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

// Global view
router.get("/", checkPermission("INVENTORY_VIEW"), inventoryController.getInventory);
router.get("/stats", checkPermission("INVENTORY_VIEW"), inventoryController.getStats);
router.get("/history", checkPermission("INVENTORY_VIEW"), inventoryController.getMovementHistory);

// Search by barcode (must be before /:bookId to avoid conflict)
router.get("/copies/barcode/:barcode", inventoryController.getCopyByBarcode);

// Specific book view
router.get("/:bookId", checkPermission("INVENTORY_VIEW"), inventoryController.getInventoryByBook);

// Stock management
router.post("/add-stock", checkPermission("STOCK_ADD"), inventoryController.addStock);
router.post("/remove-stock", checkPermission("STOCK_REMOVE"), inventoryController.removeStock);

// Transactions / Actions
router.post("/issue", checkPermission("INVENTORY_UPDATE"), inventoryController.issueBook);
router.post("/return", checkPermission("INVENTORY_UPDATE"), inventoryController.returnBook);
router.post("/reserve", checkPermission("INVENTORY_UPDATE"), inventoryController.reserveBook);
router.post("/damaged", checkPermission("INVENTORY_UPDATE"), inventoryController.markDamaged);
router.post("/lost", checkPermission("INVENTORY_UPDATE"), inventoryController.markLost);

module.exports = router;
