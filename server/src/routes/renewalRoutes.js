const express = require("express");
const router = express.Router();
const renewalController = require("../controllers/renewalController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.post("/", checkPermission("MANAGE_CIRCULATION"), renewalController.renewBook);
router.get("/history", checkPermission("VIEW_CIRCULATION"), renewalController.getRenewalsHistory);

module.exports = router;
