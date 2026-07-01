const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/", ticketController.createTicket);
router.get("/", ticketController.getTickets);
router.get("/:id", ticketController.getTicketDetails);
router.post("/:id/comments", ticketController.addComment);
router.put("/:id", ticketController.updateTicket);

module.exports = router;
