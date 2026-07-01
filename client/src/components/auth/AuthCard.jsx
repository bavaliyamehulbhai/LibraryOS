import React from 'react';

const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Left side: Form Container */}
      <div className="w-full md:w-1/2 lg:w-5/12 flex items-center justify-center p-8 sm:p-12 lg:p-16 z-10 bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo / Branding */}
          <div className="flex items-center space-x-3 mb-10">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">📚</span>
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              LibraryOS
            </span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {children}

          <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-400 font-medium">
              &copy; {new Date().getFullYear()} LibraryOS Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Abstract Premium Visual */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 relative bg-gray-50 items-center justify-center overflow-hidden">
        {/* Dynamic Abstract Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20"></div>
        
        {/* Decorative Blur Circles */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-400/30 dark:bg-blue-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-purple-400/30 dark:bg-purple-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

        {/* Feature Showcase Glass Panel */}
        <div className="relative z-10 max-w-lg p-10 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/60 dark:border-gray-700/50 rounded-3xl shadow-2xl transition-transform hover:scale-105 duration-500">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-12 w-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Next-Gen Library Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">SaaS ecosystem for modern institutions.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-2 w-3/4 bg-gray-200/60 dark:bg-gray-700/60 rounded-full"></div>
            <div className="h-2 w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full"></div>
            <div className="h-2 w-5/6 bg-gray-200/60 dark:bg-gray-700/60 rounded-full"></div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AuthCard;
