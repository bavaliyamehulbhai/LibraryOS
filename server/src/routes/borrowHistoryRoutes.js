const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/borrowHistoryController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.get("/", checkPermission("VIEW_CIRCULATION"), ctrl.getGlobalHistory);
router.get("/dashboard", checkPermission("VIEW_CIRCULATION"), ctrl.getDashboard);
router.get("/member/:memberId", checkPermission("VIEW_CIRCULATION"), ctrl.getMemberTimeline);
router.get("/book/:bookId", checkPermission("VIEW_CIRCULATION"), ctrl.getBookHistory);

module.exports = router;
