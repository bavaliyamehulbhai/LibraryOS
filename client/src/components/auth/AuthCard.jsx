import React from 'react';
import { Link } from 'react-router-dom';

const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-[440px]">
        
        {/* Minimalist Logo */}
        <div className="flex justify-center items-center mb-10">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl grayscale group-hover:grayscale-0 transition-all duration-300">📚</span>
            <span className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
              LibraryOS
            </span>
          </Link>
        </div>

        {/* The Card */}
        <div className="bg-white dark:bg-[#111111] py-10 px-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none sm:rounded-[24px] sm:px-12 border border-gray-200/60 dark:border-gray-800/80">
          
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[15px] text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>

          <div className="space-y-6">
            {children}
          </div>

        </div>
        
        <div className="mt-8 text-center">
          <p className="text-[13px] text-gray-400 dark:text-gray-600 font-medium tracking-wide">
            &copy; {new Date().getFullYear()} LibraryOS
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default AuthCard;
