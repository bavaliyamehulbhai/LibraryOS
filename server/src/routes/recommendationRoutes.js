const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/me", recommendationController.getPersonalized);
router.get("/trending", recommendationController.getTrending);
router.get("/similar/:bookId", recommendationController.getSimilar);
router.post("/ai", recommendationController.generateAI);

module.exports = router;
