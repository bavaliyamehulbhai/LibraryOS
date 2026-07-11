import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useFeatures } from '../common/FeatureGuard';
import { Home, Search, ScanLine, Bot, Menu as MenuIcon, X } from 'lucide-react';

const MobileBottomNav = () => {
  const { user } = useAuth();
  const { branding } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { hasFeature } = useFeatures();
  const userRole = user?.role || (user?.roleId?.name);

  // The 4 core quick actions for the bottom bar
  const navItems = [
    { name: "Home", path: userRole === "MEMBER" || userRole === "STUDENT" ? "/member-dashboard" : "/dashboard", icon: <Home className="w-6 h-6" /> },
    { name: "Catalog", path: "/search", icon: <Search className="w-6 h-6" /> },
    { name: "Scan", path: "/circulation/feed", icon: <ScanLine className="w-6 h-6" />, roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
    { name: "AI", path: "/ai/assistant", icon: <Bot className="w-6 h-6" /> }
  ];

  // Full Menu Items (Copied structure from Sidebar for the overlay menu)
  const fullMenuItems = [
    {
      name: "Catalog & Resources",
      icon: "📚",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT", "MEMBER", "STUDENT"],
      children: [
        { name: "Global Search", path: "/search" },
        { name: "Digital Library", path: "/digital-library" },
        { name: "Physical Shelves", path: "/shelves", roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"] },
      ]
    },
    {
      name: "My Account",
      icon: "👤",
      roles: ["MEMBER", "STUDENT"],
      children: [
        { name: "My Profile", path: "/profile" },
        { name: "My Reservations", path: "/member/reservations" },
        { name: "My Borrow History", path: "/member/history" },
      ]
    },
    {
      name: "Circulation",
      icon: "🔄",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"],
      children: [
        { name: "Live Feed", path: "/circulation/feed" },
        { name: "Issue Books", path: "/issues" },
        { name: "Return Books", path: "/returns" },
        { name: "Fines & Payments", path: "/fines" }
      ]
    },
    {
      name: "Administration",
      icon: "🏢",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"],
      children: [
        { name: "Users & Members", path: "/users" },
        { name: "Branches", path: "/branches" }
      ]
    },
    {
      name: "Analytics",
      icon: "📊",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"],
      children: [
        { name: "Analytics Dashboard", path: "/analytics" },
        { name: "Executive Reports", path: "/reports/executive" }
      ]
    },
    {
      name: "Settings",
      icon: "⚙️",
      roles: ["SUPER_ADMIN", "LIBRARY_ADMIN"],
      children: [
        { name: "General Settings", path: "/settings" },
        { name: "White Label", path: "/branding" },
        { name: "Public Portal", path: "/portal" },
      ]
    }
  ];

  const visibleNavItems = navItems.filter(item => !item.roles || item.roles.includes(userRole));
  const visibleFullMenuItems = fullMenuItems.filter(item => !item.roles || item.roles.includes(userRole));

  const handleNavClick = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Fullscreen Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-gray-900 md:hidden flex flex-col animate-fade-in pb-20 overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center font-bold text-xl text-gray-900 dark:text-white">
              {branding?.logo ? (
                <img src={branding.logo} alt="Logo" className="h-8 w-8 mr-2 rounded" />
              ) : (
                <span className="mr-2">📚</span>
              )}
              {branding?.libraryName || "LibraryOS"}
            </div>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-8">
            {/* User Info */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl flex items-center mb-6 border border-indigo-100 dark:border-indigo-800/50">
              <div className="h-12 w-12 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-xl border-2 border-white dark:border-gray-800 shadow-sm">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="ml-4">
                <p className="font-bold text-gray-900 dark:text-white">{user?.name || "User"}</p>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{userRole}</p>
              </div>
            </div>

            {/* Menu Sections */}
            {visibleFullMenuItems.map(section => (
              <div key={section.name} className="mb-6">
                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center">
                  <span className="mr-2">{section.icon}</span> {section.name}
                </h3>
                <div className="space-y-1">
                  {section.children.filter(child => !child.roles || child.roles.includes(userRole)).map(child => (
                    <button
                      key={child.name}
                      onClick={() => handleNavClick(child.path)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm border border-transparent ${location.pathname === child.path ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold border-indigo-100 dark:border-indigo-800/50' : 'bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700'}`}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-2">
          
          {/* Left Items (0 and 1) */}
          {visibleNavItems.slice(0, 2).map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400 transform -translate-y-1' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'}`}
              >
                <div className={`${isActive ? 'bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded-xl shadow-sm' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.name}</span>
              </button>
            )
          })}
          
          {/* CENTER: Menu Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isMenuOpen ? 'text-indigo-600 dark:text-indigo-400 transform -translate-y-1' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'}`}
          >
            <div className={`p-3 rounded-full shadow-lg ${isMenuOpen ? 'bg-indigo-600 text-white' : 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white transform hover:scale-105'} -mt-6 border-4 border-white dark:border-gray-900`}>
              <MenuIcon className="w-6 h-6" />
            </div>
            <span className={`text-[10px] font-bold ${isMenuOpen ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-70'}`}>Menu</span>
          </button>

          {/* Right Items (2 and 3) */}
          {visibleNavItems.slice(2, 4).map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400 transform -translate-y-1' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'}`}
              >
                <div className={`${isActive ? 'bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded-xl shadow-sm' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.name}</span>
              </button>
            )
          })}

        </div>
      </div>
    </>
  );
};

export default MobileBottomNav;
