import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useFeatures } from '../common/FeatureGuard';

const SidebarDropdown = ({ item, collapsed, userRole, hasFeature }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = item.children.some(child => location.pathname === child.path);

  useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  const visibleChildren = item.children.filter(child => {
    const roleMatch = !child.roles || child.roles.includes(userRole);
    const featureMatch = !child.feature || hasFeature(child.feature);
    return roleMatch && featureMatch;
  });

  if (visibleChildren.length === 0) return null;

  return (
    <li className="mb-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 mx-2 rounded-md transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white ${isActive ? 'bg-blue-50/50 text-blue-700 dark:bg-blue-900/20' : ''}`}
      >
        <div className="flex items-center">
          <span className="text-xl">{item.icon}</span>
          {!collapsed && <span className="ml-4 font-medium">{item.name}</span>}
        </div>
        {!collapsed && (
          <span className={`text-xs transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        )}
      </button>
      {!collapsed && isOpen && (
        <ul className="mt-1 ml-6 space-y-1 border-l-2 border-gray-100 dark:border-gray-800 pl-2">
          {visibleChildren.map(child => (
            <li key={child.name}>
              <NavLink 
                to={child.path} 
                className={({ isActive }) => 
                  `block px-4 py-2 mx-2 rounded-md transition-all duration-200 text-sm ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-600 dark:text-white font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'}`
                }
              >
                {child.name}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  const { branding } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    // --- Dashboards ---
    { name: "Circulation Dashboard", path: "/dashboard", icon: "📊", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
    { name: "My Dashboard", path: "/member-dashboard", icon: "🏠", roles: ["MEMBER", "STUDENT"] },

    // --- Catalog & Content ---
    {
      name: "Catalog & Resources",
      icon: "📚",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "MEMBER", "STUDENT"],
      children: [
        { name: "Global Search", path: "/search", icon: "🔍", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "MEMBER", "STUDENT"] },
        { name: "Search Catalog", path: "/member/catalog", icon: "🔍", roles: ["MEMBER", "STUDENT"] },
        { name: "Digital Library", path: "/digital-library", icon: "📱", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "MEMBER", "STUDENT"] },
        { name: "My Digital Content", path: "/digital-library/my-library", icon: "🗂️", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "MEMBER", "STUDENT"] },
        { name: "Physical Shelves", path: "/shelves", icon: "📚", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Research Repository", path: "/repository", icon: "🔬", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "MEMBER", "STUDENT"] }
      ]
    },

    // --- Member Area ---
    {
      name: "My Account",
      icon: "👤",
      roles: ["MEMBER", "STUDENT"],
      children: [
        { name: "My Profile", path: "/profile", icon: "👤", roles: ["MEMBER", "STUDENT"] },
        { name: "My Reservations", path: "/member/reservations", icon: "🔖", roles: ["MEMBER", "STUDENT"] },
        { name: "My Borrow History", path: "/member/history", icon: "📖", roles: ["MEMBER", "STUDENT"] },
        { name: "My Fines", path: "/member/fines", icon: "💸", roles: ["MEMBER", "STUDENT"] }
      ]
    },

    // --- AI Features ---
    {
      name: "AI Tools",
      icon: "🤖",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "STUDENT", "MEMBER"],
      children: [
        { name: "AI Copilot", path: "/ai/assistant", icon: "🤖", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "AI Study Copilot", path: "/ai/study-assistant", icon: "🧠", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "STUDENT", "MEMBER"] },
        { name: "AI Recommendations", path: "/member/recommendations", icon: "✨", roles: ["MEMBER", "STUDENT"] }
      ]
    },

    // --- Circulation & Inventory ---
    {
      name: "Circulation",
      icon: "🔄",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"],
      children: [
        { name: "Live Feed", path: "/circulation/feed", icon: "🔴", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Issue Books", path: "/issues", icon: "📚", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Return Books", path: "/returns", icon: "📥", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Renew Books", path: "/renewals", icon: "🔄", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Reservations", path: "/reservations", icon: "🔖", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Due Dates", path: "/due-dates", icon: "📅", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Fines", path: "/fines", icon: "💰", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Payments", path: "/payments", icon: "💳", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Borrow History", path: "/history", icon: "📖", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] }
      ]
    },

    // --- Administration ---
    {
      name: "Administration",
      icon: "🏢",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"],
      children: [
        { name: "Libraries", path: "/libraries", icon: "🏛️", roles: ["SUPER_ADMIN"] },
        { name: "Branches", path: "/branches", icon: "🏢", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Transfer Center", path: "/branches/transfer", icon: "🔄", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Users", path: "/users", icon: "👥", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Members", path: "/members", icon: "🧑‍🎓", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Member Cards", path: "/member-cards", icon: "🪪", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Membership Plans", path: "/membership-plans", icon: "📋", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Subscriptions", path: "/subscriptions", icon: "🎫", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] }
      ]
    },

    // --- Analytics & Reports ---
    {
      name: "Analytics",
      icon: "📊",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"],
      children: [
        { name: "Executive Reports", path: "/reports/executive", icon: "📈", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Exec Reports", path: "/analytics/reports", icon: "📄", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"], feature: "ADVANCED_ANALYTICS" },
        { name: "AI Analytics", path: "/ai-analytics", icon: "🧠", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Analytics (BI)", path: "/analytics", icon: "📊", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"], feature: "ADVANCED_ANALYTICS" },
        { name: "Member Analytics", path: "/analytics/members", icon: "👥", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"], feature: "ADVANCED_ANALYTICS" },
        { name: "Risk Analytics", path: "/analytics/risk", icon: "⚠️", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"], feature: "ADVANCED_ANALYTICS" },
        { name: "Reading Analytics", path: "/analytics/reading", icon: "📖", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"], feature: "ADVANCED_ANALYTICS" },
        { name: "Reading Dashboard", path: "/reading-analytics/dashboard", icon: "📈", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Reader Leaderboard", path: "/reading-analytics/leaderboard", icon: "🏆", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Search Analytics", path: "/search/analytics", icon: "📊", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Global Analytics", path: "/global-analytics", icon: "🌍", roles: ["SUPER_ADMIN"] }
      ]
    },

    // --- Community & Content ---
    {
      name: "Community",
      icon: "🌍",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "STUDENT", "MEMBER"],
      children: [
        { name: "Announcements", path: "/announcements", icon: "📢", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Knowledge Admin", path: "/knowledge-admin", icon: "✍️", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Help Center", path: "/help-center", icon: "📖", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "STUDENT", "MEMBER"] },
        { name: "Admin Events", path: "/admin-events", icon: "🎟️", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Community Events", path: "/events", icon: "🗓️", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "MEMBER", "STUDENT"] }
      ]
    },

    // --- Settings & Emails ---
    {
      name: "Settings",
      icon: "⚙️",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"],
      children: [
        { name: "Emails", path: "/emails/dashboard", icon: "📧", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"], feature: "EMAIL_INTEGRATION" },
        { name: "Email Logs", path: "/emails/logs", icon: "📋", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Email Templates", path: "/emails/templates", icon: "🎨", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Notif. Templates", path: "/notifications/templates", icon: "📝", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Resource Usage", path: "/usage", icon: "📈", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "White Label", path: "/branding", icon: "🎨", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"], feature: "WHITE_LABEL" },
        { name: "Theme Builder", path: "/theme-builder", icon: "🖌️", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"], feature: "WHITE_LABEL" },
        { name: "Public Portal", path: "/portal", icon: "🌍", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "General Settings", path: "/settings", icon: "⚙️", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] }
      ]
    }
  ];

  // Role based and feature based filtering
  const { hasFeature } = useFeatures();
  const userRole = user?.role || (user?.roleId?.name);
  
  const visibleMenu = menuItems.filter(item => {
    const roleMatch = !item.roles || item.roles.includes(userRole);
    const featureMatch = !item.feature || hasFeature(item.feature);
    return roleMatch && featureMatch;
  });

  return (
    <div className={`flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-20 relative ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center font-bold text-xl truncate text-gray-900 dark:text-white">
            {branding?.logo ? (
              <img src={branding.logo} alt="Logo" className="h-8 w-8 mr-2 rounded" />
            ) : (
              <span className="mr-2">📚</span>
            )}
            {branding?.libraryName || "LibraryOS"}
          </div>
        )}
        {collapsed && <span className="text-xl mx-auto">📚</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {visibleMenu.map((item) => (
            item.children ? (
              <SidebarDropdown 
                key={item.name} 
                item={item} 
                collapsed={collapsed} 
                userRole={userRole} 
                hasFeature={hasFeature} 
              />
            ) : (
              <li key={item.name}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 mx-2 rounded-md transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-600 dark:text-white font-medium shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  {!collapsed && <span className="ml-4">{item.name}</span>}
                </NavLink>
              </li>
            )
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-transparent">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center font-bold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-sm">
            {user?.name?.charAt(0) || "U"}
          </div>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name || "Admin User"}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate uppercase tracking-wide mt-0.5">{userRole}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
