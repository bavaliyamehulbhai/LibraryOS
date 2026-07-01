const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.post("/", checkPermission("AUTHOR_CREATE"), authorController.createAuthor);
router.get("/", checkPermission("AUTHOR_VIEW"), authorController.getAuthors);
router.get("/:id", checkPermission("AUTHOR_VIEW"), authorController.getAuthor);
router.get("/:id/stats", checkPermission("AUTHOR_VIEW"), authorController.getAuthorStats);
router.put("/:id", checkPermission("AUTHOR_UPDATE"), authorController.updateAuthor);
router.delete("/:id", checkPermission("AUTHOR_DELETE"), authorController.deleteAuthor);

module.exports = router;
