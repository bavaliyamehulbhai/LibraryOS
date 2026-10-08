import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useFeatures } from '../common/FeatureGuard';
import WhatsNewModal from '../common/WhatsNewModal';
import { ChevronDown } from 'lucide-react';

const SidebarDropdown = ({ item, collapsed, userRole, hasFeature }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = item.children.some(child => location.pathname === child.path);

  useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  const visibleChildren = item.children.filter(child => {
    // Check role match, but bypass feature gating
    const roleMatch = !child.roles || child.roles.includes(userRole);
    return roleMatch;
  });

  if (visibleChildren.length === 0) return null;

  return (
    <li className="mb-0.5">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-[calc(100%-8px)] mx-1 flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-xs ${
          isActive 
            ? 'bg-indigo-50/80 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 font-bold' 
            : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white font-semibold'
        }`}
      >
        <div className="flex items-center min-w-0">
          <span className="text-base shrink-0 flex items-center justify-center w-5">{item.icon}</span>
          {!collapsed && (
            <span className="ml-2.5 tracking-tight truncate whitespace-nowrap">{item.name}</span>
          )}
        </div>
        {!collapsed && (
          <ChevronDown 
            size={13} 
            className={`shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200 ml-1 ${
              isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
            }`} 
          />
        )}
      </button>

      {!collapsed && isOpen && (
        <ul className="mt-1 ml-4 pl-3 space-y-0.5 border-l border-slate-200/80 dark:border-slate-800">
          {visibleChildren.map(child => (
            <li key={child.name}>
              <NavLink 
                to={child.path} 
                className={({ isActive }) => 
                  `flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border dark:border-indigo-500/20 font-bold shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 font-medium'
                  }`
                }
              >
                {child.icon && <span className="text-xs shrink-0">{child.icon}</span>}
                <span className="truncate whitespace-nowrap">{child.name}</span>
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
    { name: "Dashboard", path: "/dashboard", icon: "📊", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
    { name: "My Dashboard", path: "/member-dashboard", icon: "🏠", roles: ["MEMBER", "STUDENT"] },

    // --- Catalog & Content ---
    {
      name: "Catalog & Resources",
      icon: "📚",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "MEMBER", "STUDENT"],
      children: [
        { name: "Global Search", path: "/search", icon: "🔍", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "MEMBER", "STUDENT"] },
        { name: "Books", path: "/books", icon: "📖", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Search Catalog", path: "/member/catalog", icon: "🔍", roles: ["MEMBER", "STUDENT"] },
        { name: "Digital Library", path: "/digital-library", icon: "📱", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "MEMBER", "STUDENT"] },
        { name: "My Digital Content", path: "/digital-library/my-library", icon: "🗂️", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "MEMBER", "STUDENT"] },
        { name: "Physical Shelves", path: "/shelves", icon: "📚", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Inventory Audit", path: "/inventory/audit", icon: "📋", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
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

    // --- Library Operations ---
    {
      name: "Operations",
      icon: "🏢",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"],
      children: [
        { name: "Attendance Dashboard", path: "/attendance/dashboard", icon: "👥", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Kiosk Mode", path: "/attendance/kiosk", icon: "🏛️", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] }
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
        { name: "Subscriptions", path: "/subscriptions", icon: "🎫", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Invoices & Billing", path: "/invoices", icon: "🧾", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Role Management", path: "/roles", icon: "🛡️", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Security Center", path: "/security", icon: "🔐", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Audit & Forensics", path: "/audit/logs", icon: "🔍", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Notifications", path: "/notifications", icon: "🔔", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] }
      ]
    },

    // --- Analytics & Reports ---
    {
      name: "Analytics",
      icon: "📊",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"],
      children: [
        { name: "Analytics (BI)", path: "/analytics", icon: "📊", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Reading Trends", path: "/analytics/reading", icon: "📖", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Risk & Defaulters", path: "/analytics/risk", icon: "⚠️", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Inventory Health", path: "/analytics/inventory", icon: "📦", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Book Velocity", path: "/analytics/books", icon: "🏆", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
        { name: "Member Analytics", path: "/analytics/members", icon: "👥", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Executive Reports", path: "/reports/executive", icon: "📈", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] }
      ]
    },

    // --- Community & Content ---
    {
      name: "Community",
      icon: "🌍",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "STUDENT", "MEMBER"],
      children: [
        { name: "Support Help Desk", path: "/support", icon: "🎫", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "STUDENT", "MEMBER"] },
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
        { name: "General Settings", path: "/settings", icon: "⚙️", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Automation Rules", path: "/settings/automation", icon: "🤖", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Email Config", path: "/emails/dashboard", icon: "📧", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"], feature: "EMAIL_INTEGRATION" },
        { name: "White Label", path: "/branding", icon: "🎨", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"], feature: "WHITE_LABEL" },
        { name: "Public Portal", path: "/portal", icon: "🌍", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] },
        { name: "Product Landing Page", path: "/landing", icon: "🚀", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"] }
      ]
    }
  ];

  // Role based and feature based filtering
  const { hasFeature } = useFeatures();
  const userRole = user?.role || (user?.roleId?.name);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  
  const visibleMenu = menuItems.filter(item => {
    // Check role match, but bypass feature gating
    const roleMatch = !item.roles || item.roles.includes(userRole);
    return roleMatch;
  });

  return (
    <>
      <aside className={`hidden md:flex flex-col h-screen bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 z-20 relative ${collapsed ? 'w-20' : 'w-[264px]'}`}>
        
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 truncate">
              {branding?.logo ? (
                <img src={branding.logo} alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-600/20">
                  📚
                </div>
              )}
              <div className="flex flex-col leading-tight truncate">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                  {branding?.libraryName || "LibraryOS"}
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                  Enterprise v2.0
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/20">
              📚
            </div>
          )}

          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto py-3 px-1.5 space-y-1">
          <ul className="space-y-0.5">
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
                <li key={item.name} className="mb-0.5">
                  <NavLink 
                    to={item.path} 
                    className={({ isActive }) => 
                      `w-[calc(100%-8px)] mx-1 flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-xs ${
                        isActive 
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20' 
                          : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white font-semibold'
                      }`
                    }
                  >
                    <span className="text-base shrink-0 flex items-center justify-center w-5">{item.icon}</span>
                    {!collapsed && <span className="ml-2.5 tracking-tight truncate whitespace-nowrap">{item.name}</span>}
                  </NavLink>
                </li>
              )
            ))}
          </ul>
        </div>

        {/* v2.0 Enterprise Bottom Badge */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
          {!collapsed ? (
            <div 
              onClick={() => setWhatsNewOpen(true)}
              className="p-2.5 rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-pink-50/30 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/30 cursor-pointer hover:border-indigo-500/40 transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    LibraryOS v2.0
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.2 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                What's new in Titanium ✨
              </p>
            </div>
          ) : (
            <div 
              onClick={() => setWhatsNewOpen(true)}
              className="flex flex-col items-center justify-center cursor-pointer p-1"
              title="LibraryOS v2.0 Enterprise"
            >
              <div className="relative">
                <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                  2.0
                </div>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Release Notes Modal from Sidebar */}
      <WhatsNewModal 
        isOpen={whatsNewOpen} 
        onClose={() => setWhatsNewOpen(false)} 
      />
    </>
  );
};

export default Sidebar;
