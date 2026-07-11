const express = require("express");
const router = express.Router();
const { getUsers, inviteNewUser, updateUser, suspendUser, restoreUser } = require("../controllers/userDirectoryController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.get("/", checkPermission("USERS_VIEW"), getUsers);
router.post("/invite", checkPermission("USERS_CREATE"), inviteNewUser);
router.put("/:id/restore", checkPermission("USERS_CREATE"), restoreUser);
router.put("/:id", checkPermission("USERS_CREATE"), updateUser);
router.delete("/:id", checkPermission("USERS_CREATE"), suspendUser);

module.exports = router;
