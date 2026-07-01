const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/chat", aiController.chat);
router.get("/sessions", aiController.getSessions);
router.get("/history/:sessionId", aiController.getHistory);

module.exports = router;
