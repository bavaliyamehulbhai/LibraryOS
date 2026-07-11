const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.post("/", checkPermission(["MANAGE_BOOKS", "MANAGE_LIBRARIES"]), categoryController.createCategory);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategory);
router.get("/:id/stats", categoryController.getCategoryStats);
router.put("/:id", checkPermission(["MANAGE_BOOKS", "MANAGE_LIBRARIES"]), categoryController.updateCategory);
router.delete("/:id", checkPermission(["MANAGE_BOOKS", "MANAGE_LIBRARIES"]), categoryController.deleteCategory);

module.exports = router;
