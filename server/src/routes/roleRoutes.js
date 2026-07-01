const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.get("/", checkPermission("ROLE_VIEW"), roleController.getRoles);
router.get("/permissions", checkPermission("ROLE_VIEW"), roleController.getPermissions);
router.post("/", checkPermission("ROLE_MANAGE"), roleController.createRole);
router.put("/:id", checkPermission("ROLE_MANAGE"), roleController.updateRole);
router.delete("/:id", checkPermission("ROLE_MANAGE"), roleController.deleteRole);

router.post("/assign/:id", checkPermission("ROLE_MANAGE"), roleController.assignRole);

module.exports = router;
