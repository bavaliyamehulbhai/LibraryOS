// Restarting server to clear rate limiters and recover nodemon
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const errorHandler = require("./middleware/errorHandler");
const auditMiddleware = require("./middleware/auditMiddleware");
const logger = require("./utils/logger");
const domainResolver = require("./middleware/domainResolverMiddleware");

const app = express();

// Trust reverse proxy (Render, Heroku, Nginx) so client IP is accurately forwarded
app.set("trust proxy", 1);

// Security and CORS First (Enables quick preflights without hitting rate limiter or crashing sanitizers)
app.use(cors());
app.use(helmet());
app.use(compression());

// Body Parsers (Must be before mongoSanitize & xssClean so req.body is defined and sanitized)
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Sanitizers (Protect against NoSQL injection and XSS)
app.use(mongoSanitize());
app.use(xssClean());

// Request logging via morgan + winston
app.use(morgan("combined", { stream: { write: message => logger.info(message.trim()) } }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50000, // High ceiling to prevent false positives while safeguarding resources
  message: { success: false, message: "Too many requests from this IP, please try again later." },
  validate: { xForwardedForHeader: false }
});
app.use("/api", apiLimiter);

// Serve static files from the uploads directory
const path = require("path");
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply domain resolver middleware globally before routes
app.use(domainResolver);

// Universal Audit Logging (Logs all API requests)
app.use("/api", auditMiddleware());

// Base health and readiness
app.use("/api/v1", require("./routes/healthRoutes"));

// Routes
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/auth/passkey", require("./routes/passkeyRoutes"));
app.use("/api/v1/oauth", require("./routes/oauthRoutes"));
app.use("/api/v1/organizations", require("./routes/organizationRoutes"));
app.use("/api/v1/governance", require("./routes/governanceRoutes"));
app.use("/api/v1/platform", require("./routes/platformRoutes"));
app.use("/api/v1/security", require("./routes/securityRoutes"));
app.use("/api/v1/libraries", require("./routes/libraryRoutes"));
app.use("/api/v1/branches", require("./routes/branchRoutes"));
app.use("/api/v1/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/v1/settings", require("./routes/settingRoutes"));
app.use("/api/v1/library-settings", require("./routes/librarySettingsRoutes"));
app.use("/api/v1/automation-settings", require("./routes/automationSettingsRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/notifications", require("./routes/notificationRoutes"));
app.use("/api/v1/announcements", require("./routes/announcementRoutes"));
app.use("/api/v1/super-admin", require("./routes/superAdminRoutes"));
app.use("/api/v1/audit-logs", require("./routes/auditRoutes"));
app.use("/api/v1/audit", require("./routes/auditRoutes"));
app.use("/api/v1/onboarding", require("./routes/onboardingRoutes"));
app.use("/api/v1/payments", require("./routes/paymentRoutes"));
app.use("/api/v1/billing", require("./routes/billingRoutes"));
app.use("/api/v1/usage", require("./routes/usageRoutes"));
app.use("/api/v1/features", require("./routes/featureRoutes"));
app.use("/api/v1/branding", require("./routes/whiteLabelRoutes"));
app.use("/api/v1/tickets", require("./routes/ticketRoutes"));
app.use("/api/v1/help", require("./routes/knowledgeBaseRoutes"));
app.use("/api/v1/tenant-analytics", require("./routes/tenantAnalyticsRoutes"));
app.use("/api/v1/global-analytics", require("./routes/globalAnalyticsRoutes"));
app.use("/api/v1/razorpay", require("./routes/razorpayRoutes"));
app.use("/api/v1/trial", require("./routes/trialRoutes"));
app.use("/api/v1/coupons", require("./routes/couponRoutes"));
app.use("/api/v1/import", require("./routes/importRoutes"));
app.use("/api/v1/export", require("./routes/exportRoutes"));
app.use("/api/v1/users", require("./routes/userDirectoryRoutes"));
app.use("/api/v1/roles", require("./routes/roleRoutes"));
app.use("/api/v1/teams", require("./routes/teamRoutes"));
app.use("/api/v1/books", require("./routes/bookRoutes"));
app.use("/api/v1/media", require("./routes/mediaRoutes"));
app.use("/api/v1/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/v1/categories", require("./routes/categoryRoutes"));
app.use("/api/v1/authors", require("./routes/authorRoutes"));
app.use("/api/v1/publishers", require("./routes/publisherRoutes"));
app.use("/api/v1/inventory", require("./routes/inventoryRoutes"));
app.use("/api/v1/inventory-audit", require("./routes/inventoryAuditRoutes"));
app.use("/api/v1/copies", require("./routes/bookCopyRoutes"));
app.use("/api/v1/locations", require("./routes/shelfRoutes"));
app.use("/api/v1/shelves", require("./routes/shelfRoutes"));
app.use("/api/v1/barcode", require("./routes/barcodeRoutes"));
app.use("/api/v1/qr", require("./routes/qrRoutes"));
app.use("/api/v1/search", require("./routes/searchRoutes"));
app.use("/api/v1/circulation", require("./routes/circulationRoutes"));
app.use("/api/v1/transfers", require("./routes/transferRoutes"));
app.use("/api/v1/recommendations", require("./routes/recommendationRoutes"));
app.use("/api/v1/ai", require("./routes/aiRoutes"));
app.use("/api/v1/scanner", require("./routes/scannerRoutes"));
app.use("/api/v1/digital-library", require("./routes/digitalLibraryRoutes"));
app.use("/api/v1/reader", require("./routes/readerRoutes"));
app.use("/api/v1/events", require("./routes/eventRoutes"));
app.use("/api/v1/public", require("./routes/publicRoutes"));
app.use("/api/v1/reading-analytics", require("./routes/readingAnalyticsRoutes"));
app.use("/api/v1/research", require("./routes/researchRoutes"));
app.use("/api/v1/attendance", require("./routes/attendanceRoutes"));
app.use("/api/v1/ai-study", require("./routes/aiStudyRoutes"));
app.use("/api/v1/ai-analytics", require("./routes/aiAnalyticsRoutes"));
app.use("/api/v1/knowledge", require("./routes/knowledgeRoutes"));
app.use("/api/v1/reports", require("./routes/reportRoutes"));
app.use("/api/v1/branch-analytics", require("./routes/branchAnalyticsRoutes"));
app.use("/api/v1/members", require("./routes/memberRoutes"));
app.use("/api/v1/membership-plans", require("./routes/membershipPlanRoutes"));
app.use("/api/v1/member-cards", require("./routes/memberCardRoutes"));
app.use("/api/v1/member-dashboard", require("./routes/memberDashboardRoutes"));
app.use("/api/v1/issues", require("./routes/issueRoutes"));
app.use("/api/v1/returns", require("./routes/returnRoutes"));
app.use("/api/v1/reservations", require("./routes/reservationRoutes"));
app.use("/api/v1/renewals", require("./routes/renewalRoutes"));
app.use("/api/v1/fines", require("./routes/fineRoutes"));
app.use("/api/v1/due-dates", require("./routes/dueDateRoutes"));
app.use("/api/v1/borrowing-limits", require("./routes/borrowingPolicyRoutes"));
app.use("/api/v1/history", require("./routes/borrowHistoryRoutes"));
app.use("/api/v1/emails", require("./routes/emailRoutes"));
app.use("/api/v1/analytics", require("./routes/analyticsRoutes"));
app.use("/api/v1/circulation-dashboard", require("./routes/circulationDashboardRoutes"));
app.use("/api/v1/sms", require("./routes/smsRoutes"));
app.use("/api/v1/whatsapp", require("./routes/whatsappRoutes"));
app.use("/api/v1/vendors", require("./routes/vendorRoutes"));
app.use("/api/v1/marketplace", require("./routes/marketplaceRoutes"));
app.use("/api/v1/procurement", require("./routes/procurementRoutes"));
app.use("/api/v1/forum", require("./routes/forumRoutes"));
app.use("/api/v1/gamification", require("./routes/gamificationRoutes"));
app.use("/api/v1/academic", require("./routes/academicRoutes"));

// Scheduled Jobs
const cron = require("node-cron");
const reservationService = require("./services/reservationService");

// Run every hour to check for expired reservations
cron.schedule("0 * * * *", () => {
  console.log("[SYSTEM] Running hourly reservation expiry job...");
  reservationService.expireReservationsJob().catch(console.error);
});

// Global Error Handler
app.use(errorHandler);

const { checkTrialExpiry } = require("./jobs/trialExpiryJob");
const { startEmailWorker } = require("./workers/emailWorker");
const { startAnalyticsJob } = require("./jobs/analyticsJob");
const { startFineJob } = require("./jobs/fineJob");
const { startReminderJob } = require("./jobs/reminderJob");
const { startSubscriptionJob } = require("./jobs/subscriptionJob");
const { startCleanupJob } = require("./jobs/cleanupJob");
const { startBackupJob } = require("./jobs/backupJob");
const { startScheduledExportJob } = require("./jobs/scheduledExportJob");
const { startAutomationEngine } = require("./jobs/automationEngine");

// Start Background Jobs
checkTrialExpiry();
startEmailWorker();
startAnalyticsJob();
startFineJob();
startReminderJob();
startSubscriptionJob();
startCleanupJob();
startBackupJob();
startScheduledExportJob();
startAutomationEngine();

module.exports = app;
