const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.post("/", checkPermission("CATEGORY_CREATE"), categoryController.createCategory);
router.get("/", checkPermission("CATEGORY_VIEW"), categoryController.getCategories);
router.get("/:id", checkPermission("CATEGORY_VIEW"), categoryController.getCategory);
router.get("/:id/stats", checkPermission("CATEGORY_VIEW"), categoryController.getCategoryStats);
router.put("/:id", checkPermission("CATEGORY_UPDATE"), categoryController.updateCategory);
router.delete("/:id", checkPermission("CATEGORY_DELETE"), categoryController.deleteCategory);

module.exports = router;
