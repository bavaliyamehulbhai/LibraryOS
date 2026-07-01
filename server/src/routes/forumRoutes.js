const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

router.get("/posts", checkPermission([PERMISSIONS.FORUM_ACCESS]), forumController.getPosts);
router.post("/posts", checkPermission([PERMISSIONS.FORUM_ACCESS]), forumController.createPost);
router.get("/posts/:id", checkPermission([PERMISSIONS.FORUM_ACCESS]), forumController.getPostDetails);
router.post("/posts/:id/comments", checkPermission([PERMISSIONS.FORUM_ACCESS]), forumController.addComment);
router.post("/posts/:id/upvote", checkPermission([PERMISSIONS.FORUM_ACCESS]), forumController.upvotePost);

module.exports = router;
