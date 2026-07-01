const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.post("/", checkPermission("MANAGE_CIRCULATION"), reservationController.reserveBook);
router.get("/", checkPermission("VIEW_CIRCULATION"), reservationController.getReservations);
router.put("/:id/cancel", checkPermission("MANAGE_CIRCULATION"), reservationController.cancelReservation);
router.put("/:id/collect", checkPermission("MANAGE_CIRCULATION"), reservationController.collectReservation);

module.exports = router;
