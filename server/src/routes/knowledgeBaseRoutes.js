const express = require("express");
const router = express.Router();
const kbController = require("../controllers/knowledgeBaseController");
const authMiddleware = require("../middleware/authMiddleware");

// Public/Semi-public routes (Depends on tenant context, handled inside controller)
// In a real app, you might allow unauthenticated access to public articles, 
// but we'll apply authMiddleware to keep it simple for now, or just inject req.user if present.
// Let's make help center accessible for logged in users.
router.use(authMiddleware);

router.get("/categories", kbController.getCategories);
router.get("/articles", kbController.getArticles);
router.get("/articles/:slug", kbController.getArticleBySlug);
router.post("/articles/:id/feedback", kbController.submitFeedback);

// Admin only routes for managing content
router.post("/categories", kbController.createCategory);
router.post("/articles", kbController.createArticle);

module.exports = router;
