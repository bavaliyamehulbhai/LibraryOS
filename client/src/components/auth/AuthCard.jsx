import React from 'react';

const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 sm:p-8 font-sans">
      
      <div className="w-full max-w-[1000px] flex flex-col md:flex-row rounded-3xl overflow-hidden glass-panel">
        
        {/* Left side: Branding & Visual */}
        <div className="hidden md:flex md:w-5/12 relative flex-col justify-between p-10 bg-black/5 dark:bg-black/20 border-r border-white/10">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">📚</span>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200">
                LibraryOS
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Next-Gen <br/>
              <span className="text-indigo-600 dark:text-indigo-400">Library</span> <br/>
              Management
            </h1>
            <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
              A state-of-the-art SaaS ecosystem for modern educational institutions.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="h-1.5 w-1/3 bg-indigo-500/50 rounded-full"></div>
            <div className="h-1.5 w-2/3 bg-gray-400/30 rounded-full"></div>
            <div className="h-1.5 w-1/2 bg-gray-400/30 rounded-full"></div>
          </div>
        </div>

        {/* Right side: Form Container */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center relative bg-white/40 dark:bg-slate-900/40">
          <div className="w-full max-w-md mx-auto">
            
            {/* Mobile Branding */}
            <div className="flex md:hidden items-center space-x-3 mb-10 justify-center">
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">📚</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                LibraryOS
              </span>
            </div>

            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {subtitle}
                </p>
              )}
            </div>

            {children}

            <div className="mt-12 pt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                &copy; {new Date().getFullYear()} LibraryOS Inc. All rights reserved.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthCard;
