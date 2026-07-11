import React from 'react';
import { createRoot } from 'react-dom/client';

export const confirmAlert = (message, confirmText = 'Confirm', cancelText = 'Cancel') => {
  return new Promise((resolve) => {
    const modalRoot = document.createElement('div');
    document.body.appendChild(modalRoot);
    const root = createRoot(modalRoot);

    const handleResolve = (result) => {
      root.unmount();
      modalRoot.remove();
      resolve(result);
    };

    root.render(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in transition-opacity">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full mx-4 transform transition-all text-center border border-white/20 dark:border-gray-700/50">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Are you sure?</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">{message}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => handleResolve(false)}
              className="flex-1 px-5 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => handleResolve(true)}
              className="flex-1 px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  });
};
