const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

router.get("/", checkPermission([PERMISSIONS.SEARCH_VIEW]), searchController.quickSearch);
router.get("/global", checkPermission([PERMISSIONS.SEARCH_VIEW]), searchController.globalSearch);
router.get("/semantic", checkPermission([PERMISSIONS.SEARCH_VIEW]), searchController.semanticSearch);
router.get("/analytics", checkPermission([PERMISSIONS.SEARCH_ANALYTICS_VIEW]), searchController.getAnalytics);
router.get("/stats", checkPermission([PERMISSIONS.SEARCH_ANALYTICS_VIEW]), searchController.getAnalytics); // Alias for analytics
router.get("/books", checkPermission([PERMISSIONS.SEARCH_VIEW]), searchController.bookSearch);
router.get("/authors", checkPermission([PERMISSIONS.SEARCH_VIEW]), searchController.authorSearch);
router.get("/publishers", checkPermission([PERMISSIONS.SEARCH_VIEW]), searchController.publisherSearch);
router.get("/copies", checkPermission([PERMISSIONS.SEARCH_VIEW]), searchController.copySearch);
router.get("/shelves", checkPermission([PERMISSIONS.SEARCH_VIEW]), searchController.shelfSearch);
router.get("/suggestions", checkPermission([PERMISSIONS.SEARCH_VIEW]), searchController.getSuggestions);

module.exports = router;
