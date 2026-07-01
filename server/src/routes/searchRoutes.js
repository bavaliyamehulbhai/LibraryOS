const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

router.get("/global", checkPermission([PERMISSIONS.SEARCH_VIEW]), searchController.globalSearch);
router.get("/semantic", checkPermission([PERMISSIONS.SEARCH_VIEW]), searchController.semanticSearch);
router.get("/analytics", checkPermission([PERMISSIONS.SEARCH_ANALYTICS_VIEW]), searchController.getAnalytics);

module.exports = router;
