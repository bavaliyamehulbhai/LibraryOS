import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";
import AcceptInvite from "../pages/auth/AcceptInvite";
import OAuthCallback from "../pages/auth/OAuthCallback";

// Layout
import DashboardLayout from "../components/layout/DashboardLayout";
import AuthLayout from "../layouts/AuthLayout";

// Modules
import Dashboard from "../pages/dashboard/Dashboard";
import Books from "../pages/books/Books";
import CreateBook from "../pages/books/CreateBook";
import EditBook from "../pages/books/EditBook";
import BookDetails from "../pages/books/BookDetails";
import BookGallery from "../pages/books/BookGallery";
import CoverManager from "../pages/books/CoverManager";
import Categories from "../pages/categories/Categories";
import CreateCategory from "../pages/categories/CreateCategory";
import EditCategory from "../pages/categories/EditCategory";
import CategoryDetails from "../pages/categories/CategoryDetails";
import Authors from "../pages/authors/Authors";
import CreateAuthor from "../pages/authors/CreateAuthor";
import EditAuthor from "../pages/authors/EditAuthor";
import AuthorDetails from "../pages/authors/AuthorDetails";
import Publishers from "../pages/publishers/Publishers";
import CreatePublisher from "../pages/publishers/CreatePublisher";
import EditPublisher from "../pages/publishers/EditPublisher";
import PublisherDetails from "../pages/publishers/PublisherDetails";
import Inventory from "../pages/inventory/Inventory";
import InventoryDetails from "../pages/inventory/InventoryDetails";
import StockMovement from "../pages/inventory/StockMovement";
import Copies from "../pages/copies/Copies";
import CopyDetails from "../pages/copies/CopyDetails";
import CopyHistory from "../pages/copies/CopyHistory";
import Floors from "../pages/shelves/Floors";
import Sections from "../pages/shelves/Sections";
import Racks from "../pages/shelves/Racks";
import Shelves from "../pages/shelves/Shelves";
import ShelfDetails from "../pages/shelves/ShelfDetails";
import Barcodes from "../pages/barcodes/Barcodes";
import BarcodeScanner from "../pages/barcodes/BarcodeScanner";
import BarcodePrint from "../pages/barcodes/BarcodePrint";
import QRManager from "../pages/qr/QRManager";
import QRScanner from "../pages/qr/QRScanner";
import QRAnalytics from "../pages/qr/QRAnalytics";
import BookPublicView from "../pages/public/BookPublicView";
import SearchResults from "../pages/search/SearchResults";
import BookImport from "../pages/import/BookImport";
import ImportHistory from "../pages/import/ImportHistory";
import ExportCenter from "../pages/export/ExportCenter";
import ExportHistory from "../pages/export/ExportHistory";
import ScheduledExports from "../pages/export/ScheduledExports";
import DashboardAnalytics from "../pages/analytics/DashboardAnalytics";
import BookAnalytics from "../pages/analytics/BookAnalytics";
import InventoryAnalytics from "../pages/analytics/InventoryAnalytics";
import TrendAnalytics from "../pages/analytics/TrendAnalytics";
import AuditLogs from "../pages/audit/AuditLogs";
import ActivityLogs from "../pages/audit/ActivityLogs";
import SecurityLogs from "../pages/audit/SecurityLogs";
import ComplianceReports from "../pages/audit/ComplianceReports";
import Roles from "../pages/roles/Roles";
import CreateRole from "../pages/roles/CreateRole";
import RoleDetails from "../pages/roles/RoleDetails";
import Students from "../pages/students/Students";
import Transactions from "../pages/transactions/Transactions";
import Reports from "../pages/reports/Reports";
import ISBNReport from "../pages/reports/ISBNReport";
import ImportData from "../pages/import/ImportData";
import ExportData from "../pages/export/ExportData";
import SystemSettings from "../pages/settings/SystemSettings";
import OrganizationProfile from "../pages/organization/OrganizationProfile";
import Announcements from "../pages/announcements/Announcements";
import LibraryRegistration from "../pages/onboarding/LibraryRegistration";
import SetupWizard from "../pages/onboarding/SetupWizard";
import Plans from "../pages/subscription/Plans";
import Billing from "../pages/subscription/Billing";
import Invoices from "../pages/billing/Invoices";
import RevenueDashboard from "../pages/billing/RevenueDashboard";
import SubscriptionCheckout from "../pages/subscription/SubscriptionCheckout";
import TrialDashboard from "../pages/trial/TrialDashboard";
import InvoiceAnalytics from "../pages/billing/InvoiceAnalytics";
import CouponsDashboard from "../pages/coupons/CouponsDashboard";
import SuperAdminDashboard from "../pages/super-admin/Dashboard";
import TenantsDashboard from "../pages/super-admin/Tenants";
import AnalyticsOverview from "../pages/analytics/AnalyticsOverview";
import UsageDashboard from "../pages/usage/UsageDashboard";
import BrandingSettings from "../pages/branding/BrandingSettings";
import ThemeBuilder from "../pages/branding/ThemeBuilder";
import Tickets from "../pages/support/Tickets";
import TicketDetails from "../pages/support/TicketDetails";
import HelpCenter from "../pages/help/HelpCenter";
import ArticleDetails from "../pages/help/ArticleDetails";
import NotificationCenter from "../pages/notifications/NotificationCenter";
import GlobalDashboard from "../pages/global-analytics/GlobalDashboard";
import Settings from "../pages/settings/Settings";
import Users from "../pages/settings/Users";
import BranchSettings from "../pages/settings/BranchSettings";
import SecurityDashboard from "../pages/security/SecurityDashboard";
import SecurityCenter from "../pages/security/SecurityCenter";
import SecurityOperations from "../pages/security/SecurityOperations";
import TeamManagement from "../pages/organization/TeamManagement";
import PlatformDashboard from "../pages/platform/PlatformDashboard";
import ExecutiveDashboard from "../pages/platform/ExecutiveDashboard";

// Common
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import GuestRoute from "./GuestRoute";
import Unauthorized from "../pages/Unauthorized";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Auth Layout */}
        <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<LibraryRegistration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
        </Route>
        
        {/* OAuth Callback outside of AuthLayout so it doesn't show standard UI */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Public Routes */}
        <Route path="/public/copies/:id" element={<BookPublicView />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default redirect from '/' to '/dashboard' */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* Books Core */}
          <Route path="books" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT"]}><Books /></RoleRoute>} />
          <Route path="books/gallery" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT"]}><BookGallery /></RoleRoute>} />
          <Route path="books/cover-manager" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><CoverManager /></RoleRoute>} />
          <Route path="books/create" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><CreateBook /></RoleRoute>} />
          <Route path="books/edit/:id" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><EditBook /></RoleRoute>} />
          <Route path="books/:id" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><BookDetails /></RoleRoute>} />
          <Route path="categories" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><Categories /></RoleRoute>} />
          <Route path="categories/create" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><CreateCategory /></RoleRoute>} />
          <Route path="categories/edit/:id" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><EditCategory /></RoleRoute>} />
          <Route path="categories/:id" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><CategoryDetails /></RoleRoute>} />
          <Route path="authors" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><Authors /></RoleRoute>} />
          <Route path="authors/create" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><CreateAuthor /></RoleRoute>} />
          <Route path="authors/edit/:id" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><EditAuthor /></RoleRoute>} />
          <Route path="authors/:id" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><AuthorDetails /></RoleRoute>} />
          <Route path="publishers" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><Publishers /></RoleRoute>} />
          <Route path="publishers/create" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><CreatePublisher /></RoleRoute>} />
          <Route path="publishers/edit/:id" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><EditPublisher /></RoleRoute>} />
          <Route path="publishers/:id" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><PublisherDetails /></RoleRoute>} />
          <Route path="inventory" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><Inventory /></RoleRoute>} />
          <Route path="inventory/movements" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><StockMovement /></RoleRoute>} />
          <Route path="inventory/:bookId" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><InventoryDetails /></RoleRoute>} />
          <Route path="copies" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><Copies /></RoleRoute>} />
          <Route path="copies/history" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><CopyHistory /></RoleRoute>} />
          <Route path="copies/:id" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><CopyDetails /></RoleRoute>} />
          <Route path="shelves" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><Shelves /></RoleRoute>} />
          <Route path="shelves/floors" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><Floors /></RoleRoute>} />
          <Route path="shelves/sections" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><Sections /></RoleRoute>} />
          <Route path="shelves/racks" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><Racks /></RoleRoute>} />
          <Route path="shelves/:id" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><ShelfDetails /></RoleRoute>} />
          <Route path="barcodes" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><Barcodes /></RoleRoute>} />
          <Route path="barcodes/scanner" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><BarcodeScanner /></RoleRoute>} />
          <Route path="barcodes/print" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><BarcodePrint /></RoleRoute>} />
          
          {/* QR System */}
          <Route path="qr" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><QRManager /></RoleRoute>} />
          <Route path="qr/scanner" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><QRScanner /></RoleRoute>} />
          <Route path="qr/analytics" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><QRAnalytics /></RoleRoute>} />

          {/* Organization, Settings & Onboarding */}
          <Route path="organization-profile" element={<OrganizationProfile />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="setup-wizard" element={<SetupWizard />} />
          <Route path="plans" element={<Plans />} />
          <Route path="checkout" element={<SubscriptionCheckout />} />
          <Route path="users" element={<Users />} />
          <Route path="branches" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><BranchSettings /></RoleRoute>} />
          <Route path="analytics" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><AnalyticsOverview /></RoleRoute>} />
          <Route path="usage" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><UsageDashboard /></RoleRoute>} />
          <Route path="billing" element={<Billing />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoice-analytics" element={<RoleRoute allowedRoles={["SUPER_ADMIN"]}><InvoiceAnalytics /></RoleRoute>} />
          <Route path="trials" element={<RoleRoute allowedRoles={["SUPER_ADMIN"]}><TrialDashboard /></RoleRoute>} />
          <Route path="coupons" element={<RoleRoute allowedRoles={["SUPER_ADMIN"]}><CouponsDashboard /></RoleRoute>} />
          <Route path="super-admin" element={<RoleRoute allowedRoles={["SUPER_ADMIN"]}><SuperAdminDashboard /></RoleRoute>} />
          <Route path="tenants" element={<RoleRoute allowedRoles={["SUPER_ADMIN"]}><TenantsDashboard /></RoleRoute>} />
          <Route path="revenue-dashboard" element={<RoleRoute allowedRoles={["SUPER_ADMIN"]}><RevenueDashboard /></RoleRoute>} />
          <Route path="branding" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><BrandingSettings /></RoleRoute>} />
          <Route path="theme-builder" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><ThemeBuilder /></RoleRoute>} />
          <Route path="support" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><Tickets /></RoleRoute>} />
          <Route path="support/:id" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><TicketDetails /></RoleRoute>} />
          <Route path="help" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "STUDENT", "FACULTY"]}><HelpCenter /></RoleRoute>} />
          <Route path="help/article/:slug" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "STUDENT", "FACULTY"]}><ArticleDetails /></RoleRoute>} />
          <Route path="notifications" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "STUDENT", "FACULTY"]}><NotificationCenter /></RoleRoute>} />
          <Route path="global-analytics" element={<RoleRoute allowedRoles={["SUPER_ADMIN"]}><GlobalDashboard /></RoleRoute>} />
          <Route path="search" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT"]}><SearchResults /></RoleRoute>} />

          {/* Import System */}
          <Route path="import" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><BookImport /></RoleRoute>} />
          <Route path="import/history" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><ImportHistory /></RoleRoute>} />

          {/* Export System */}
          <Route path="export" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><ExportCenter /></RoleRoute>} />
          <Route path="export/history" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><ExportHistory /></RoleRoute>} />
          <Route path="export/scheduled" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><ScheduledExports /></RoleRoute>} />

          {/* Analytics System */}
          <Route path="analytics" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><DashboardAnalytics /></RoleRoute>} />
          <Route path="analytics/dashboard" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><DashboardAnalytics /></RoleRoute>} />
          <Route path="analytics/books" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><BookAnalytics /></RoleRoute>} />
          <Route path="analytics/inventory" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><InventoryAnalytics /></RoleRoute>} />
          <Route path="analytics/trends" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><TrendAnalytics /></RoleRoute>} />

          {/* Audit System */}
          <Route path="audit/logs" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><AuditLogs /></RoleRoute>} />
          <Route path="audit/activity" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><ActivityLogs /></RoleRoute>} />
          <Route path="audit/security" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><SecurityLogs /></RoleRoute>} />
          <Route path="audit/compliance" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><ComplianceReports /></RoleRoute>} />

          {/* Role Management */}
          <Route path="roles" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><Roles /></RoleRoute>} />
          <Route path="roles/new" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><CreateRole /></RoleRoute>} />
          <Route path="roles/:id" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><RoleDetails /></RoleRoute>} />

          <Route path="students" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><Students /></RoleRoute>} />
          <Route path="transactions" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT"]}><Transactions /></RoleRoute>} />
          <Route path="reports" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><Reports /></RoleRoute>} />
          <Route path="isbn-report" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"]}><ISBNReport /></RoleRoute>} />
          <Route path="security" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><SecurityDashboard /></RoleRoute>} />
          <Route path="secops" element={<RoleRoute allowedRoles={["SUPER_ADMIN"]}><SecurityOperations /></RoleRoute>} />
          <Route path="platform" element={<RoleRoute allowedRoles={["SUPER_ADMIN"]}><PlatformDashboard /></RoleRoute>} />
          <Route path="executive-dashboard" element={<RoleRoute allowedRoles={["SUPER_ADMIN"]}><ExecutiveDashboard /></RoleRoute>} />
          <Route path="security-center" element={<SecurityCenter />} />
          <Route path="settings" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><Settings /></RoleRoute>} />
          <Route path="team" element={<RoleRoute allowedRoles={["SUPER_ADMIN", "LIBRARY_ADMIN"]}><TeamManagement /></RoleRoute>} />
        </Route>

        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
