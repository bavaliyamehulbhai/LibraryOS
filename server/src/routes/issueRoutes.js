const express = require("express");
const router = express.Router();
const issueController = require("../controllers/issueController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.post("/", checkPermission("MANAGE_CIRCULATION"), issueController.issueBook);
router.get("/", checkPermission("VIEW_CIRCULATION"), issueController.getIssues);
router.get("/:id", checkPermission("VIEW_CIRCULATION"), issueController.getIssueDetails);

module.exports = router;
