const express = require("express");
const router = express.Router();
const returnController = require("../controllers/returnController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.post("/", checkPermission("MANAGE_CIRCULATION"), returnController.returnBook);
router.get("/", checkPermission("VIEW_CIRCULATION"), returnController.getReturns);
router.get("/:id/print", checkPermission("VIEW_CIRCULATION"), returnController.printReceipt);

module.exports = router;
