const express = require("express");
const router = express.Router();
const circulationController = require("../controllers/circulationController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

// Issue Book
router.post("/issue", checkPermission("CIRCULATION_ISSUE"), circulationController.issueBook);

// Return Book
router.post("/return", checkPermission("CIRCULATION_RETURN"), circulationController.returnBook);

// Renew Book
router.post("/renew", checkPermission("CIRCULATION_RENEW"), circulationController.renewBook);

// Get All Transactions
router.get("/", checkPermission("CIRCULATION_VIEW"), circulationController.getTransactions);

module.exports = router;
