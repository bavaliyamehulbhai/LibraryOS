const express = require("express");
const router = express.Router();
const billingController = require("../controllers/billingController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// All billing routes require authentication
router.use(authMiddleware);

// Tenant Billing APIs
router.get("/invoices", checkPermission("MANAGE_SETTINGS"), billingController.getInvoices);
router.post("/invoices", checkPermission("MANAGE_SETTINGS"), billingController.generateInvoice);
router.get("/invoices/:id/download", checkPermission("MANAGE_SETTINGS"), billingController.downloadInvoice);
router.post("/payments", checkPermission("MANAGE_SETTINGS"), billingController.recordPayment);

// Super Admin Revenue Dashboard & Analytics
router.get("/dashboard", checkPermission("SUPER_ADMIN"), billingController.getRevenueDashboard);
router.get("/invoices-analytics", checkPermission("SUPER_ADMIN"), billingController.getInvoiceAnalytics);

module.exports = router;
