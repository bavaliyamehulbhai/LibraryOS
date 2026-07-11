const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/memberDashboardController");
const authMiddleware = require("../middleware/authMiddleware");

// Note: We don't use checkPermission here because any logged-in user with a Member profile
// should be able to view their own dashboard.
router.use(authMiddleware);

router.get("/", dashboardController.getDashboard);
router.get("/stats", dashboardController.getBorrowStats);
router.get("/fines", dashboardController.getFinesHistory);
router.get("/reservations", dashboardController.getMyReservations);
router.post("/reservations", dashboardController.reserveBook);
router.put("/reservations/:id/cancel", dashboardController.cancelMyReservation);
router.post("/fines/pay", dashboardController.payFines);
router.put("/renew/:transactionId", dashboardController.renewBook);

module.exports = router;
