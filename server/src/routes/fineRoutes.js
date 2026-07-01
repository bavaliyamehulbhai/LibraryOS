const express = require("express");
const router = express.Router();
const fineController = require("../controllers/fineController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.post("/manual", checkPermission("MANAGE_CIRCULATION"), fineController.createManualFine);
router.get("/", checkPermission("VIEW_CIRCULATION"), fineController.getFines);
router.get("/:id", checkPermission("VIEW_CIRCULATION"), fineController.getFineById);
router.put("/:id/waive", checkPermission("MANAGE_CIRCULATION"), fineController.waiveFine);

module.exports = router;
