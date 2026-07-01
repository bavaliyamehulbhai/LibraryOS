const express = require("express");
const router = express.Router();
const transferController = require("../controllers/transferController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.use(authMiddleware);

// Only admins or branch managers should access transfer routes
router.use(authorize("SUPER_ADMIN", "LIBRARY_ADMIN"));

router.post("/", transferController.requestTransfer);
router.get("/", transferController.getTransfers);
router.put("/:id/approve", transferController.approveTransfer);
router.put("/:id/transit", transferController.markInTransit);
router.put("/:id/receive", transferController.receiveTransfer);

module.exports = router;
