const express = require("express");
const router = express.Router();
const shelfController = require("../controllers/shelfController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

router.post("/", checkPermission([PERMISSIONS.SHELF_MANAGE]), shelfController.createShelf);
router.get("/", checkPermission([PERMISSIONS.SHELF_VIEW]), shelfController.getShelves);
router.get("/analytics", checkPermission([PERMISSIONS.SHELF_VIEW]), shelfController.getAnalytics);
router.post("/recommend", checkPermission([PERMISSIONS.SHELF_VIEW]), shelfController.recommendShelf);
router.post("/ai-assistant", checkPermission([PERMISSIONS.SHELF_MANAGE]), shelfController.aiAssistant);

module.exports = router;
