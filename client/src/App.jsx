import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { getCurrentUser } from './redux/features/auth/authThunks';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { FeatureProvider } from './components/common/FeatureGuard';

// Layouts & Routing Utilities
import DashboardLayout from './layouts/DashboardLayout';
import RoleBasedRedirect from './components/common/RoleBasedRedirect';

// Member Dashboard Pages
import MemberDashboard from './pages/member-dashboard/MemberDashboard';
import MemberHistory from './pages/member-dashboard/MemberHistory';
import MemberFines from './pages/member-dashboard/MemberFines';
import MemberCatalog from './pages/member-dashboard/MemberCatalog';
import MemberReservations from './pages/member-dashboard/MemberReservations';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOtp from './pages/auth/VerifyOtp';
import ResetPassword from './pages/auth/ResetPassword';
import AcceptInvite from './pages/auth/AcceptInvite';
import OAuthCallback from './pages/auth/OAuthCallback';

// Dashboard Pages
import CirculationDashboard from './pages/dashboard/CirculationDashboard';
import RealtimeFeed from './pages/dashboard/RealtimeFeed';
import Libraries from './pages/libraries/Libraries';
import Branches from './pages/branches/Branches';
import BranchDetails from './pages/branches/BranchDetails';
import TransferCenter from './pages/branches/TransferCenter';
import Users from './pages/users/Users';
import Members from './pages/members/Members';
import CreateMember from './pages/members/CreateMember';
import MemberDetails from './pages/members/MemberDetails';
import Settings from './pages/settings/Settings';
import ImportCenter from './pages/import-export/ImportCenter';
import ExportCenter from './pages/import-export/ExportCenter';
import OnboardingWizard from './pages/onboarding/OnboardingWizard';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import NotificationCenter from './pages/notifications/NotificationCenter';
import AuditLogs from './pages/audit/AuditLogs';
import Reports from './pages/reports/Reports';

// Branch Analytics Pages
import BranchOverview from './pages/branch-analytics/Overview';
import BranchComparison from './pages/branch-analytics/Comparison';
import BranchRankings from './pages/branch-analytics/Rankings';
import BranchReports from './pages/branch-analytics/Reports';

// AI Copilot Page
import Assistant from './pages/ai/Assistant';

// Scanner Pages
import BookScanner from './pages/scanner/BookScanner';
import ScanHistory from './pages/scanner/ScanHistory';

// Digital Library Pages
import DigitalLibrary from './pages/digital-library/DigitalLibrary';
import ResourceDetails from './pages/digital-library/ResourceDetails';
import MyLibrary from './pages/digital-library/MyLibrary';
import UploadResource from './pages/digital-library/UploadResource';

// Reader
import Reader from './pages/reader/Reader';

// Removed Marketplace, Vendors, Procurement

// Events
import EventsDashboard from './pages/events/EventsDashboard';
import AdminEventManagement from './pages/events/AdminEventManagement';

// Public Portal
import PublicPortal from './pages/public/PublicPortal';
import PublicBookDetails from './pages/public/PublicBookDetails';

// Analytics & Dashboards
import BranchAnalyticsDashboard from './pages/branch-analytics/Overview';
import AIAnalyticsDashboard from './pages/analytics/AIAnalyticsDashboard';

// Reading Analytics
import ReadingDashboard from './pages/analytics/ReadingDashboard';
import ReaderLeaderboard from './pages/analytics/ReaderLeaderboard';

// Research Repository
import ResearchRepository from './pages/repository/ResearchRepository';
import ResearchDetails from './pages/repository/ResearchDetails';
import UploadResearch from './pages/repository/UploadResearch';

// Search
import GlobalSearch from './pages/search/GlobalSearch';
import SearchAnalytics from './pages/search/SearchAnalytics';

// Shelves
import ShelfDashboard from './pages/shelves/ShelfDashboard';
import ShelfRecommendations from './pages/shelves/ShelfRecommendations';

// Reports
import ExecutiveDashboard from './pages/reports/ExecutiveDashboard';

// AI Study Assistant
import StudyAssistant from './pages/ai-study/StudyAssistant';

// Knowledge Base
import HelpCenter from './pages/knowledge/HelpCenter';
import KnowledgeAdmin from './pages/knowledge/KnowledgeAdmin';

// Removed Gamification, Forum

// Notifications
import AnnouncementManager from './pages/notifications/AnnouncementManager';

import ActivationDashboard from './pages/activation/ActivationDashboard';
import Profile from './pages/profile/Profile';
import Workspace from './pages/workspace/Workspace';
import UsageDashboard from './pages/usage/UsageDashboard';

// Recommendation Dashboard
import RecommendationDashboard from './pages/recommendations/RecommendationDashboard';

// Membership Plan Pages
import MembershipPlans from './pages/membership/MembershipPlans';
import CreatePlan from './pages/membership/CreatePlan';
import EditPlan from './pages/membership/EditPlan';
import PlanDetails from './pages/membership/PlanDetails';

// Member Card Pages
import MemberCards from './pages/member-cards/MemberCards';
import GenerateCard from './pages/member-cards/GenerateCard';
import CardDetails from './pages/member-cards/CardDetails';

// Issue Pages
import IssueBook from './pages/issues/IssueBook';
import IssueHistory from './pages/issues/IssueHistory';
import IssueDetails from './pages/issues/IssueDetails';

// Return Pages
import ReturnBook from './pages/returns/ReturnBook';
import ReturnHistory from './pages/returns/ReturnHistory';
import ReturnDetails from './pages/returns/ReturnDetails';

// Reservation Pages
import Reservations from './pages/reservations/Reservations';
import CreateReservation from './pages/reservations/CreateReservation';

// Renewal Pages
import RenewBook from './pages/renewals/RenewBook';
import RenewalHistory from './pages/renewals/RenewalHistory';
import RenewalDetails from './pages/renewals/RenewalDetails';

// Fine Pages
import Fines from './pages/fines/Fines';

// Payment Pages
import Payments from './pages/payments/Payments';
import CreatePayment from './pages/payments/CreatePayment';
import PaymentDetails from './pages/payments/PaymentDetails';

// Due Date Pages
import DueDashboard from './pages/due-dates/DueDashboard';
import OverdueBooks from './pages/due-dates/OverdueBooks';

// Borrowing Pages
import BorrowingDashboard from './pages/borrowing/BorrowingDashboard';
import Policies from './pages/borrowing/Policies';

// History Pages
import BorrowHistory from './pages/history/BorrowHistory';
import MemberTimeline from './pages/history/MemberTimeline';

// Notification Pages
import Templates from './pages/notifications/Templates';
import NotificationSettings from './pages/notifications/NotificationSettings';

// Email Pages
import EmailDashboard from './pages/emails/EmailDashboard';
import EmailLogs from './pages/emails/EmailLogs';
import EmailTemplates from './pages/emails/EmailTemplates';
import ComposeEmail from './pages/emails/ComposeEmail';

// Removed SMS, WhatsApp

// Analytics Pages
import MemberAnalytics from './pages/analytics/MemberAnalytics';
import ReadingAnalytics from './pages/analytics/ReadingAnalytics';
import RiskAnalytics from './pages/analytics/RiskAnalytics';

// Placeholder Pages
import Subscriptions from './pages/subscriptions/Subscriptions';
import BrandingSettings from './pages/branding/BrandingSettings';
import ThemeBuilder from './pages/branding/ThemeBuilder';
import Tickets from './pages/support/Tickets';
import CreateTicket from './pages/support/CreateTicket';
import TicketDetails from './pages/support/TicketDetails';
import ArticleDetails from './pages/help/ArticleDetails';
import GlobalDashboard from './pages/global-analytics/GlobalDashboard';

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
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />

            {/* Onboarding Wizard (Protected but outside dashboard layout) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<OnboardingWizard />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<RoleBasedRedirect />} />
                <Route path="/member-dashboard" element={<RoleRoute allowedRoles={['MEMBER', 'STUDENT', 'SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><MemberDashboard /></RoleRoute>} />
                <Route path="/member/history" element={<RoleRoute allowedRoles={['MEMBER', 'STUDENT']}><MemberHistory /></RoleRoute>} />
                <Route path="/member/fines" element={<RoleRoute allowedRoles={['MEMBER', 'STUDENT']}><Fines /></RoleRoute>} />
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
                <Route path="/shelves/recommendations" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><ShelfRecommendations /></RoleRoute>} />

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
                <Route path="/import" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><ImportCenter /></RoleRoute>} />
                <Route path="/export" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><ExportCenter /></RoleRoute>} />
                <Route path="/subscriptions" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><Subscriptions /></RoleRoute>} />
                <Route path="/branding" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><BrandingSettings /></RoleRoute>} />
                <Route path="/theme-builder" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><ThemeBuilder /></RoleRoute>} />
                <Route path="/support" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><Tickets /></RoleRoute>} />
                <Route path="/support/new" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><CreateTicket /></RoleRoute>} />
                <Route path="/support/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><TicketDetails /></RoleRoute>} />
                <Route path="/help/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN']}><ArticleDetails /></RoleRoute>} />
                <Route path="/global-analytics" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><GlobalDashboard /></RoleRoute>} />
                <Route path="/analytics" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><AnalyticsDashboard /></RoleRoute>} />
                <Route path="/notifications" element={<NotificationCenter />} />
                <Route path="/audit" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><AuditLogs /></RoleRoute>} />
                <Route path="/reports" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><Reports /></RoleRoute>} />
                <Route path="/activation" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><ActivationDashboard /></RoleRoute>} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/workspace" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><Workspace /></RoleRoute>} />
                <Route path="/usage" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'LIBRARY_ADMIN']}><UsageDashboard /></RoleRoute>} />
              </Route>
            </Route>

            {/* Catch All */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/portal" element={<PublicPortal />} />
          <Route path="/portal/book/:id" element={<PublicBookDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </FeatureProvider>
    </ThemeProvider>
  </ErrorBoundary>
  );
}

export default App;
