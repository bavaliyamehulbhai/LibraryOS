import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/features/auth/authThunks';
import api from '../../services/api';
import NotificationBell from './NotificationBell';
import CommandPalette from '../common/CommandPalette';
import WhatsNewModal from '../common/WhatsNewModal';
import { APP_VERSION } from '../../constants/version';
import { 
  Command, Sparkles, Moon, Sun, ChevronDown, User, 
  Settings, Building2, LogOut, Search, ShieldCheck 
} from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/v1/auth/logout');
    } catch (err) {
      console.error(err);
    }
    dispatch(logoutUser());
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const roleName = user?.role ? user.role.replace('_', ' ') : 'MEMBER';

  return (
    <>
      <header className="h-16 glass-nav sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-all duration-200">
        
        {/* Left Section: Mobile Brand & Command Palette Trigger */}
        <div className="flex items-center gap-3">
          {/* Mobile Branding */}
          <div className="flex md:hidden items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
            <span className="text-xl">📚</span>
            <span>LibraryOS</span>
            <span className="text-[10px] px-1.5 py-0.5 font-bold uppercase rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              v{APP_VERSION}
            </span>
          </div>

          {/* Linear-style Command Palette Search Trigger Button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex items-center justify-between w-64 lg:w-80 px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all duration-200 shadow-sm group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="text-xs font-medium">Quick search or command...</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] font-semibold text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300/60 dark:border-slate-700">
              <span>Ctrl K</span>
            </div>
          </button>
        </div>

        {/* Right Section: Version Pill, Theme, Notifications, Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* v2.0 Enterprise Badge with Clickable Release Highlights */}
          <button
            onClick={() => setWhatsNewOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 transition-all hover:scale-105 shadow-sm"
            title="View What's New in LibraryOS v2.0"
          >
            <Sparkles size={13} className="text-indigo-500 animate-pulse" />
            <span>v{APP_VERSION} Enterprise</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-transform active:scale-95"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-amber-400" />}
          </button>

          {/* Realtime Notification Center Bell */}
          <NotificationBell />

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition focus:outline-none"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-indigo-500/20">
                {userInitial}
              </div>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
                  {roleName}
                </span>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl py-2 border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setDropdownOpen(false)}
              >
                {/* User Summary Card */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user?.email || 'admin@libraryos.com'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse"></span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Active Tenant Session
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-1 space-y-0.5">
                  <button 
                    onClick={() => navigate('/profile')} 
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-xl transition"
                  >
                    <User size={15} className="text-slate-400" />
                    <span>Profile Settings</span>
                  </button>

                  <button 
                    onClick={() => navigate('/workspace')} 
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-xl transition"
                  >
                    <Building2 size={15} className="text-slate-400" />
                    <span>Workspace & Tenant</span>
                  </button>

                  <button 
                    onClick={() => setCommandPaletteOpen(true)} 
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-xl transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Command size={15} className="text-indigo-500" />
                      <span>Command Palette</span>
                    </div>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-400">Ctrl K</kbd>
                  </button>

                  <button 
                    onClick={() => setWhatsNewOpen(true)} 
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition"
                  >
                    <Sparkles size={15} className="text-indigo-500" />
                    <span>What's New in v{APP_VERSION}</span>
                  </button>
                </div>

                <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800/80 px-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </header>

      {/* Global Command Palette Modal */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
        onOpenWhatsNew={() => setWhatsNewOpen(true)}
      />

      {/* Global What's New in v2.0 Release Modal */}
      <WhatsNewModal 
        isOpen={whatsNewOpen} 
        onClose={() => setWhatsNewOpen(false)} 
      />
    </>
  );
};

export default Navbar;

