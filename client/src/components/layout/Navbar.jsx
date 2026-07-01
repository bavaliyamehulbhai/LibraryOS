import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import GlobalSearch from '../search/GlobalSearch';
import NotificationBell from './NotificationBell';

import { useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/features/auth/authThunks';

const Navbar = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/v1/auth/logout');
    } catch (err) {
      console.error(err);
    }
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="h-16 glass-nav shadow-sm flex items-center justify-between px-6 sticky top-0 z-10">
      
      <div className="flex-1 flex items-center">
        <GlobalSearch />
      </div>

      <div className="flex items-center space-x-6">
        {/* Dark Mode Toggle */}
        <button onClick={toggleTheme} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 transition-transform hover:scale-110">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* Real Notification Bell */}
        <NotificationBell />

        {/* Profile Dropdown */}

        <div className="relative">
          <button 
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
            }}

            className="flex items-center focus:outline-none"
          >
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-400 transition-transform hover:scale-105 shadow-sm">
              {user?.name?.charAt(0) || "U"}
            </div>
            <span className="ml-2 text-xs font-bold text-gray-500 dark:text-gray-400">▼</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 border border-gray-100 dark:border-gray-700 transform transition-all z-50">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'admin@libraryos.com'}</p>
              </div>
              <button 
                onClick={() => { navigate('/profile'); setDropdownOpen(false); }} 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Profile Settings
              </button>
              <button 
                onClick={() => { navigate('/workspace'); setDropdownOpen(false); }} 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Workspace Details
              </button>
              <hr className="my-1 border-gray-100 dark:border-gray-700" />
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Navbar;
