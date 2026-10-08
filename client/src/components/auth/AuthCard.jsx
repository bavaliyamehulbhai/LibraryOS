import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { APP_VERSION } from '../../constants/version';

const AuthCard = ({ title, subtitle, children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden transition-colors duration-200">
      
      {/* Ambient Radial Gradient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Floating Header Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition shadow-sm"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} className="text-amber-400" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[460px] relative z-10">
        
        {/* Brand & Version Header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 group mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              📚
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              LibraryOS
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles size={12} className="text-indigo-500 animate-pulse" />
            <span>Titanium Enterprise v{APP_VERSION}</span>
          </div>
        </div>

        {/* The Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-indigo-950/5">
          
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {children}
          </div>

        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-600 font-medium">
            &copy; {new Date().getFullYear()} LibraryOS Enterprise • Multi-Tenant Platform
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default AuthCard;

