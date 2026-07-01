const express = require("express");
const router = express.Router();
const { getUsers, inviteNewUser, updateUser, suspendUser } = require("../controllers/userDirectoryController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.get("/", checkPermission("USERS_VIEW"), getUsers);
router.post("/invite", checkPermission("USERS_CREATE"), inviteNewUser);
router.put("/:id", checkPermission("USERS_VIEW"), updateUser);
router.delete("/:id", checkPermission("USERS_VIEW"), suspendUser);

module.exports = router;
