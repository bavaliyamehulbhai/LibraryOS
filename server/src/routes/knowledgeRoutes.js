const express = require("express");
const router = express.Router();
const knowledgeController = require("../controllers/knowledgeController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const PERMISSIONS = require("../constants/permissions");

router.use(authMiddleware);

// Articles
router.get("/articles", checkPermission([PERMISSIONS.KNOWLEDGE_VIEW]), knowledgeController.getArticles);
router.get("/articles/:id", checkPermission([PERMISSIONS.KNOWLEDGE_VIEW]), knowledgeController.getArticleById);
router.post("/articles", checkPermission([PERMISSIONS.KNOWLEDGE_MANAGE]), knowledgeController.createArticle);
router.post("/articles/:id/feedback", checkPermission([PERMISSIONS.KNOWLEDGE_VIEW]), knowledgeController.submitFeedback);

// FAQs
router.get("/faqs", checkPermission([PERMISSIONS.KNOWLEDGE_VIEW]), knowledgeController.getFAQs);
router.post("/faqs", checkPermission([PERMISSIONS.KNOWLEDGE_MANAGE]), knowledgeController.createFAQ);

module.exports = router;
