const express = require("express");
const router = express.Router();
const cardController = require("../controllers/memberCardController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.get("/stats", checkPermission("VIEW_MEMBERS"), cardController.getAnalytics);
router.post("/verify", checkPermission("VIEW_MEMBERS"), cardController.verifyCard);

router.get("/", checkPermission("VIEW_MEMBERS"), cardController.getCards);
router.post("/", checkPermission("MANAGE_MEMBERS"), cardController.generateCard);
router.get("/:id", checkPermission("VIEW_MEMBERS"), cardController.getCardById);
router.put("/:id/lost", checkPermission("MANAGE_MEMBERS"), cardController.reportLost);
router.post("/:id/replace", checkPermission("MANAGE_MEMBERS"), cardController.replaceCard);
router.get("/:id/print", checkPermission("VIEW_MEMBERS"), cardController.printCard);

module.exports = router;
