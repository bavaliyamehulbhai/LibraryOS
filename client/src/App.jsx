import { useEffect, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { getCurrentUser } from './redux/features/auth/authThunks';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { FeatureProvider } from './components/common/FeatureGuard';
import Loader from './components/common/Loader';
import ScrollToTop from './components/common/ScrollToTop';

// Layouts & Routing Utilities
import DashboardLayout from './layouts/DashboardLayout';
import RoleBasedRedirect from './components/common/RoleBasedRedirect';

// Lazy Loaded Pages for Instant Performance (No bundle bloat)
const MemberDashboard = lazy(() => import('./pages/member-dashboard/MemberDashboard'));
const MemberHistory = lazy(() => import('./pages/member-dashboard/MemberHistory'));
const MemberFines = lazy(() => import('./pages/member-dashboard/MemberFines'));
const MemberCatalog = lazy(() => import('./pages/member-dashboard/MemberCatalog'));
const MemberReservations = lazy(() => import('./pages/member-dashboard/MemberReservations'));

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const VerifyOtp = lazy(() => import('./pages/auth/VerifyOtp'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const AcceptInvite = lazy(() => import('./pages/auth/AcceptInvite'));
const OAuthCallback = lazy(() => import('./pages/auth/OAuthCallback'));

// Dashboard Pages
const CirculationDashboard = lazy(() => import('./pages/dashboard/CirculationDashboard'));
const RealtimeFeed = lazy(() => import('./pages/dashboard/RealtimeFeed'));
const Libraries = lazy(() => import('./pages/libraries/Libraries'));
const Branches = lazy(() => import('./pages/branches/Branches'));
const BranchDetails = lazy(() => import('./pages/branches/BranchDetails'));
const TransferCenter = lazy(() => import('./pages/branches/TransferCenter'));
const Users = lazy(() => import('./pages/users/Users'));
const Members = lazy(() => import('./pages/members/Members'));
const CreateMember = lazy(() => import('./pages/members/CreateMember'));
const MemberDetails = lazy(() => import('./pages/members/MemberDetails'));
const AuditDashboard = lazy(() => import('./pages/inventory/AuditDashboard'));
const ActiveAudit = lazy(() => import('./pages/inventory/ActiveAudit'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const AutomationSettings = lazy(() => import('./pages/settings/AutomationSettings'));
const ImportCenter = lazy(() => import('./pages/import-export/ImportCenter'));
const ExportCenter = lazy(() => import('./pages/import-export/ExportCenter'));
const OnboardingWizard = lazy(() => import('./pages/onboarding/OnboardingWizard'));
const AnalyticsDashboard = lazy(() => import('./pages/analytics/AnalyticsDashboard'));
const NotificationCenter = lazy(() => import('./pages/notifications/NotificationCenter'));
const AuditLogs = lazy(() => import('./pages/audit/AuditLogs'));
const ActivityLogs = lazy(() => import('./pages/audit/ActivityLogs'));
const SecurityLogs = lazy(() => import('./pages/audit/SecurityLogs'));
const ComplianceReports = lazy(() => import('./pages/audit/ComplianceReports'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const Roles = lazy(() => import('./pages/roles/Roles'));
const CreateRole = lazy(() => import('./pages/roles/CreateRole'));
const RoleDetails = lazy(() => import('./pages/roles/RoleDetails'));
const SecurityDashboard = lazy(() => import('./pages/security/SecurityDashboard'));

// Books & Catalog
const Books = lazy(() => import('./pages/books/Books'));
const CreateBook = lazy(() => import('./pages/books/CreateBook'));
const EditBook = lazy(() => import('./pages/books/EditBook'));
const BookDetails = lazy(() => import('./pages/books/BookDetails'));
const BookGallery = lazy(() => import('./pages/books/BookGallery'));
const CoverManager = lazy(() => import('./pages/books/CoverManager'));

// Branch Analytics Pages
const BranchOverview = lazy(() => import('./pages/branch-analytics/Overview'));
const BranchComparison = lazy(() => import('./pages/branch-analytics/Comparison'));
const BranchRankings = lazy(() => import('./pages/branch-analytics/Rankings'));
const BranchReports = lazy(() => import('./pages/branch-analytics/Reports'));

// AI Copilot Page
const Assistant = lazy(() => import('./pages/ai/Assistant'));

// Scanner Pages
const BookScanner = lazy(() => import('./pages/scanner/BookScanner'));
const ScanHistory = lazy(() => import('./pages/scanner/ScanHistory'));

// Digital Library Pages
const DigitalLibrary = lazy(() => import('./pages/digital-library/DigitalLibrary'));
const ResourceDetails = lazy(() => import('./pages/digital-library/ResourceDetails'));
const MyLibrary = lazy(() => import('./pages/digital-library/MyLibrary'));
const UploadResource = lazy(() => import('./pages/digital-library/UploadResource'));

// Reader
const Reader = lazy(() => import('./pages/reader/Reader'));

// Events
const EventsDashboard = lazy(() => import('./pages/events/EventsDashboard'));
const AdminEventManagement = lazy(() => import('./pages/events/AdminEventManagement'));

// Public Portal & Landing Page
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const PublicPortal = lazy(() => import('./pages/public/PublicPortal'));
const PublicBookDetails = lazy(() => import('./pages/public/PublicBookDetails'));

// Analytics & Dashboards
const BranchAnalyticsDashboard = lazy(() => import('./pages/branch-analytics/Overview'));
const AIAnalyticsDashboard = lazy(() => import('./pages/analytics/AIAnalyticsDashboard'));

// Reading Analytics
const ReadingDashboard = lazy(() => import('./pages/analytics/ReadingDashboard'));
const ReaderLeaderboard = lazy(() => import('./pages/analytics/ReaderLeaderboard'));

// Research Repository
const ResearchRepository = lazy(() => import('./pages/repository/ResearchRepository'));
const ResearchDetails = lazy(() => import('./pages/repository/ResearchDetails'));
const UploadResearch = lazy(() => import('./pages/repository/UploadResearch'));

// Search
const GlobalSearch = lazy(() => import('./pages/search/GlobalSearch'));
const SearchAnalytics = lazy(() => import('./pages/search/SearchAnalytics'));

// Shelves
const ShelfDashboard = lazy(() => import('./pages/shelves/ShelfDashboard'));
const ShelfRecommendations = lazy(() => import('./pages/shelves/ShelfRecommendations'));

// Reports
const ExecutiveDashboard = lazy(() => import('./pages/reports/ExecutiveDashboard'));

// AI Study Assistant
const StudyAssistant = lazy(() => import('./pages/ai-study/StudyAssistant'));

// Knowledge Base
const HelpCenter = lazy(() => import('./pages/knowledge/HelpCenter'));
const KnowledgeAdmin = lazy(() => import('./pages/knowledge/KnowledgeAdmin'));

// Notifications
const AnnouncementManager = lazy(() => import('./pages/notifications/AnnouncementManager'));

const ActivationDashboard = lazy(() => import('./pages/activation/ActivationDashboard'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Workspace = lazy(() => import('./pages/workspace/Workspace'));
const UsageDashboard = lazy(() => import('./pages/usage/UsageDashboard'));

// Recommendation Dashboard
const RecommendationDashboard = lazy(() => import('./pages/recommendations/RecommendationDashboard'));

// Membership Plan Pages
const MembershipPlans = lazy(() => import('./pages/membership/MembershipPlans'));
const CreatePlan = lazy(() => import('./pages/membership/CreatePlan'));
const EditPlan = lazy(() => import('./pages/membership/EditPlan'));
const PlanDetails = lazy(() => import('./pages/membership/PlanDetails'));

// Member Card Pages
const MemberCards = lazy(() => import('./pages/member-cards/MemberCards'));
const GenerateCard = lazy(() => import('./pages/member-cards/GenerateCard'));
const CardDetails = lazy(() => import('./pages/member-cards/CardDetails'));

// Issue Pages
const IssueBook = lazy(() => import('./pages/issues/IssueBook'));
const IssueHistory = lazy(() => import('./pages/issues/IssueHistory'));
const IssueDetails = lazy(() => import('./pages/issues/IssueDetails'));

// Return Pages
const ReturnBook = lazy(() => import('./pages/returns/ReturnBook'));
const ReturnHistory = lazy(() => import('./pages/returns/ReturnHistory'));

// Attendance Pages
const AttendanceKiosk = lazy(() => import('./pages/attendance/AttendanceKiosk'));
const AttendanceDashboard = lazy(() => import('./pages/attendance/AttendanceDashboard'));
const ReturnDetails = lazy(() => import('./pages/returns/ReturnDetails'));

// Reservation Pages
const Reservations = lazy(() => import('./pages/reservations/Reservations'));
const CreateReservation = lazy(() => import('./pages/reservations/CreateReservation'));

// Renewal Pages
const RenewBook = lazy(() => import('./pages/renewals/RenewBook'));
const RenewalHistory = lazy(() => import('./pages/renewals/RenewalHistory'));
const RenewalDetails = lazy(() => import('./pages/renewals/RenewalDetails'));

// Fine Pages
const Fines = lazy(() => import('./pages/fines/Fines'));

// Payment Pages
const Payments = lazy(() => import('./pages/payments/Payments'));
const CreatePayment = lazy(() => import('./pages/payments/CreatePayment'));
const PaymentDetails = lazy(() => import('./pages/payments/PaymentDetails'));

// Due Date Pages
const DueDashboard = lazy(() => import('./pages/due-dates/DueDashboard'));
const OverdueBooks = lazy(() => import('./pages/due-dates/OverdueBooks'));

// Borrowing Pages
const BorrowingDashboard = lazy(() => import('./pages/borrowing/BorrowingDashboard'));
const Policies = lazy(() => import('./pages/borrowing/Policies'));

// History Pages
const BorrowHistory = lazy(() => import('./pages/history/BorrowHistory'));
const MemberTimeline = lazy(() => import('./pages/history/MemberTimeline'));

// Notification Pages
const Templates = lazy(() => import('./pages/notifications/Templates'));
const NotificationSettings = lazy(() => import('./pages/notifications/NotificationSettings'));

// Email Pages
const EmailDashboard = lazy(() => import('./pages/emails/EmailDashboard'));
const EmailLogs = lazy(() => import('./pages/emails/EmailLogs'));
const EmailTemplates = lazy(() => import('./pages/emails/EmailTemplates'));
const ComposeEmail = lazy(() => import('./pages/emails/ComposeEmail'));

// Analytics Pages
const MemberAnalytics = lazy(() => import('./pages/analytics/MemberAnalytics'));
const ReadingAnalytics = lazy(() => import('./pages/analytics/ReadingAnalytics'));
const RiskAnalytics = lazy(() => import('./pages/analytics/RiskAnalytics'));
const InventoryAnalytics = lazy(() => import('./pages/analytics/InventoryAnalytics'));
const BookAnalytics = lazy(() => import('./pages/analytics/BookAnalytics'));

// Subscriptions & Billing
const Subscriptions = lazy(() => import('./pages/subscriptions/Subscriptions'));
const Invoices = lazy(() => import('./pages/billing/Invoices'));
const BrandingSettings = lazy(() => import('./pages/branding/BrandingSettings'));
const ThemeBuilder = lazy(() => import('./pages/branding/ThemeBuilder'));
const Tickets = lazy(() => import('./pages/support/Tickets'));
const CreateTicket = lazy(() => import('./pages/support/CreateTicket'));
const TicketDetails = lazy(() => import('./pages/support/TicketDetails'));
const ArticleDetails = lazy(() => import('./pages/help/ArticleDetails'));
const GlobalDashboard = lazy(() => import('./pages/global-analytics/GlobalDashboard'));

function App() {
  const dispatch = useDispatch();
  const loading = useSelector(state => state.auth.loading);
  const token = useSelector(state => state.auth.token);

  useEffect(() => {
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]);

  if (loading && token) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">Loading Platform...</div>;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <FeatureProvider>
          <Toaster position="top-right" />
          <Router>
            <ScrollToTop />
            <Suspense fallback={<Loader />}>
              <Routes>
            {/* Public Landing & Marketing */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/portal" element={<PublicPortal />} />
            <Route path="/portal/book/:id" element={<PublicBookDetails />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />

            {/* Onboarding Wizard (Public so new users can create libraries) */}
            <Route path="/onboarding" element={<OnboardingWizard />} />

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<RoleBasedRedirect />} />
                <Route path="/member-dashboard" element={<RoleRoute allowedRoles={['MEMBER', 'STUDENT', 'SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><MemberDashboard /></RoleRoute>} />
                <Route path="/member/history" element={<RoleRoute allowedRoles={['MEMBER', 'STUDENT']}><MemberHistory /></RoleRoute>} />
                <Route path="/member/fines" element={<RoleRoute allowedRoles={['MEMBER', 'STUDENT']}><MemberFines /></RoleRoute>} />
                <Route path="/member/recommendations" element={<RoleRoute allowedRoles={['MEMBER', 'STUDENT']}><RecommendationDashboard /></RoleRoute>} />
                <Route path="/member/catalog" element={<RoleRoute allowedRoles={['MEMBER', 'STUDENT']}><MemberCatalog /></RoleRoute>} />
                <Route path="/member/reservations" element={<RoleRoute allowedRoles={['MEMBER', 'STUDENT']}><MemberReservations /></RoleRoute>} />
                <Route path="/dashboard" element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}>
                    <CirculationDashboard />
                  </RoleRoute>
                } />
                <Route path="/circulation/feed" element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}>
                    <RealtimeFeed />
                  </RoleRoute>
                } />
                <Route path="/libraries" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><Libraries /></RoleRoute>} />
                
                {/* Book & Catalog Routes */}
                <Route path="/books" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'ASSISTANT']}><Books /></RoleRoute>} />
                <Route path="/books/gallery" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'ASSISTANT']}><BookGallery /></RoleRoute>} />
                <Route path="/books/cover-manager" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><CoverManager /></RoleRoute>} />
                <Route path="/books/create" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><CreateBook /></RoleRoute>} />
                <Route path="/books/new" element={<Navigate to="/books/create" replace />} />
                <Route path="/books/edit/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><EditBook /></RoleRoute>} />
                <Route path="/books/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><BookDetails /></RoleRoute>} />
                <Route path="/students/new" element={<Navigate to="/members/new" replace />} />
                <Route path="/transactions" element={<Navigate to="/issues" replace />} />
                
                <Route path="/branches" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><Branches /></RoleRoute>} />
                <Route path="/branches/transfer" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><TransferCenter /></RoleRoute>} />
                <Route path="/branches/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><BranchDetails /></RoleRoute>} />
                <Route path="/users" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><Users /></RoleRoute>} />
                <Route path="/members" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><Members /></RoleRoute>} />
                <Route path="/members/new" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><CreateMember /></RoleRoute>} />
                <Route path="/members/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><MemberDetails /></RoleRoute>} />
                <Route path="/membership-plans" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><MembershipPlans /></RoleRoute>} />
                <Route path="/membership-plans/new" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><CreatePlan /></RoleRoute>} />
                <Route path="/membership-plans/:id/edit" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><EditPlan /></RoleRoute>} />
                <Route path="/membership-plans/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><PlanDetails /></RoleRoute>} />
                <Route path="/member-cards" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><MemberCards /></RoleRoute>} />
                <Route path="/member-cards/generate" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><GenerateCard /></RoleRoute>} />
                <Route path="/member-cards/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><CardDetails /></RoleRoute>} />
                <Route path="/issues" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><IssueHistory /></RoleRoute>} />
                <Route path="/issues/new" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><IssueBook /></RoleRoute>} />
                <Route path="/issues/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><IssueDetails /></RoleRoute>} />
                
                <Route path="/attendance/kiosk" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><AttendanceKiosk /></RoleRoute>} />
                <Route path="/attendance/dashboard" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><AttendanceDashboard /></RoleRoute>} />
                
                <Route path="/returns" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><ReturnHistory /></RoleRoute>} />
                <Route path="/returns/new" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><ReturnBook /></RoleRoute>} />
                <Route path="/returns/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><ReturnDetails /></RoleRoute>} />
                
                <Route path="/reservations" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><Reservations /></RoleRoute>} />
                <Route path="/reservations/new" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><CreateReservation /></RoleRoute>} />
                
                <Route path="/renewals" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><RenewBook /></RoleRoute>} />
                <Route path="/renewals/history" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><RenewalHistory /></RoleRoute>} />
                <Route path="/renewals/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><RenewalDetails /></RoleRoute>} />
                
                <Route path="/fines" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><Fines /></RoleRoute>} />

                <Route path="/payments" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><Payments /></RoleRoute>} />
                <Route path="/payments/new" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><CreatePayment /></RoleRoute>} />
                <Route path="/payments/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><PaymentDetails /></RoleRoute>} />

                <Route path="/due-dates" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><DueDashboard /></RoleRoute>} />
                <Route path="/due-dates/overdue" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><OverdueBooks /></RoleRoute>} />

                <Route path="/borrowing" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><BorrowingDashboard /></RoleRoute>} />
                <Route path="/borrowing/policies" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><Policies /></RoleRoute>} />

                <Route path="/history" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><BorrowHistory /></RoleRoute>} />
                <Route path="/history/member/:memberId" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><MemberTimeline /></RoleRoute>} />

                <Route path="/notifications" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'MEMBER']}><NotificationCenter /></RoleRoute>} />
                <Route path="/notifications/settings" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'MEMBER']}><NotificationSettings /></RoleRoute>} />
                <Route path="/notifications/templates" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><Templates /></RoleRoute>} />

                <Route path="/emails/dashboard" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><EmailDashboard /></RoleRoute>} />
                <Route path="/emails/logs" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><EmailLogs /></RoleRoute>} />
                <Route path="/emails/templates" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><EmailTemplates /></RoleRoute>} />
                <Route path="/emails/compose" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><ComposeEmail /></RoleRoute>} />


                <Route path="/analytics/members" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><MemberAnalytics /></RoleRoute>} />
                <Route path="/analytics/reading" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><ReadingAnalytics /></RoleRoute>} />
                <Route path="/analytics/risk" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><RiskAnalytics /></RoleRoute>} />
                <Route path="/analytics/inventory" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><InventoryAnalytics /></RoleRoute>} />
                <Route path="/analytics/books" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><BookAnalytics /></RoleRoute>} />
                <Route path="/analytics/reports" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><Reports /></RoleRoute>} />
                
                <Route path="/branch-analytics/overview" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><BranchOverview /></RoleRoute>} />
                <Route path="/branch-analytics/comparison" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><BranchComparison /></RoleRoute>} />
                <Route path="/branch-analytics/rankings" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><BranchRankings /></RoleRoute>} />
                <Route path="/branch-analytics/reports" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><BranchReports /></RoleRoute>} />

                <Route path="/ai/assistant" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><Assistant /></RoleRoute>} />

                <Route path="/scanner" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><BookScanner /></RoleRoute>} />
                <Route path="/scanner/history" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><ScanHistory /></RoleRoute>} />

                <Route path="/digital-library" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'ASSISTANT', 'MEMBER', 'STUDENT']}><DigitalLibrary /></RoleRoute>} />
                <Route path="/digital-library/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'ASSISTANT', 'MEMBER', 'STUDENT']}><ResourceDetails /></RoleRoute>} />
                <Route path="/digital-library/my-library" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'ASSISTANT', 'MEMBER', 'STUDENT']}><MyLibrary /></RoleRoute>} />
                <Route path="/digital-library/upload" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><UploadResource /></RoleRoute>} />
                <Route path="/reader/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'ASSISTANT', 'MEMBER', 'STUDENT']}><Reader /></RoleRoute>} />


                <Route path="/events" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'ASSISTANT', 'MEMBER', 'STUDENT']}><EventsDashboard /></RoleRoute>} />
                <Route path="/admin-events" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><AdminEventManagement /></RoleRoute>} />

                <Route path="/reading-analytics/dashboard" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><ReadingDashboard /></RoleRoute>} />
                <Route path="/reading-analytics/leaderboard" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><ReaderLeaderboard /></RoleRoute>} />

                <Route path="/repository" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'ASSISTANT', 'MEMBER', 'STUDENT']}><ResearchRepository /></RoleRoute>} />
                <Route path="/repository/upload" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'ASSISTANT', 'MEMBER', 'STUDENT']}><UploadResearch /></RoleRoute>} />
                <Route path="/repository/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'ASSISTANT', 'MEMBER', 'STUDENT']}><ResearchDetails /></RoleRoute>} />

                <Route path="/search" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'ASSISTANT', 'MEMBER', 'STUDENT']}><GlobalSearch /></RoleRoute>} />
                <Route path="/search/analytics" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><SearchAnalytics /></RoleRoute>} />

                <Route path="/shelves" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><ShelfDashboard /></RoleRoute>} />
                <Route path="/shelves/dashboard" element={<Navigate to="/shelves" replace />} />
                <Route path="/shelves/recommendations" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><ShelfRecommendations /></RoleRoute>} />
                
                {/* Inventory Audit */}
                <Route path="/inventory/audit" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><AuditDashboard /></RoleRoute>} />
                <Route path="/inventory/audit/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><ActiveAudit /></RoleRoute>} />

                <Route path="/branch-analytics" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><BranchAnalyticsDashboard /></RoleRoute>} />
                <Route path="/ai-analytics" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><AIAnalyticsDashboard /></RoleRoute>} />
                <Route path="/reports/executive" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><ExecutiveDashboard /></RoleRoute>} />

                <Route path="/ai/study-assistant" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'ASSISTANT', 'STUDENT', 'MEMBER']}><StudyAssistant /></RoleRoute>} />


                {/* Knowledge Base */}
                <Route path="/help-center" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN', 'ASSISTANT', 'STUDENT', 'MEMBER']}><HelpCenter /></RoleRoute>} />
                <Route path="/knowledge-admin" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><KnowledgeAdmin /></RoleRoute>} />


                {/* Notifications */}
                <Route path="/announcements" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><AnnouncementManager /></RoleRoute>} />

                <Route path="/settings" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><Settings /></RoleRoute>} />
                <Route path="/settings/automation" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><AutomationSettings /></RoleRoute>} />
                <Route path="/import" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><ImportCenter /></RoleRoute>} />
                <Route path="/export" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><ExportCenter /></RoleRoute>} />
                <Route path="/subscriptions" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><Subscriptions /></RoleRoute>} />
                <Route path="/invoices" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><Invoices /></RoleRoute>} />
                <Route path="/branding" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><BrandingSettings /></RoleRoute>} />
                <Route path="/theme-builder" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><ThemeBuilder /></RoleRoute>} />
                <Route path="/support" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><Tickets /></RoleRoute>} />
                <Route path="/support/new" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><CreateTicket /></RoleRoute>} />
                <Route path="/support/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><TicketDetails /></RoleRoute>} />
                <Route path="/roles" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><Roles /></RoleRoute>} />
                <Route path="/roles/new" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><CreateRole /></RoleRoute>} />
                <Route path="/roles/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><RoleDetails /></RoleRoute>} />
                <Route path="/security" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><SecurityDashboard /></RoleRoute>} />
                <Route path="/help/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><ArticleDetails /></RoleRoute>} />
                <Route path="/help/article/:slug" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><ArticleDetails /></RoleRoute>} />
                <Route path="/global-analytics" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><GlobalDashboard /></RoleRoute>} />
                <Route path="/audit" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><AuditLogs /></RoleRoute>} />
                <Route path="/audit/logs" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><AuditLogs /></RoleRoute>} />
                <Route path="/audit/activity" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><ActivityLogs /></RoleRoute>} />
                <Route path="/audit/security" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><SecurityLogs /></RoleRoute>} />
                <Route path="/audit/compliance" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><ComplianceReports /></RoleRoute>} />
                <Route path="/reports" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><Reports /></RoleRoute>} />
                <Route path="/activation" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><ActivationDashboard /></RoleRoute>} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/workspace" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><Workspace /></RoleRoute>} />
                <Route path="/usage" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><UsageDashboard /></RoleRoute>} />
              </Route>
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
      </FeatureProvider>
    </ThemeProvider>
  </ErrorBoundary>
  );
}

export default App;
