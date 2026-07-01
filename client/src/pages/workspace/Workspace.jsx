import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Workspace = () => {
  const { user } = useAuth();
  
  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Workspace Details</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-8">
          
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
            <div className="h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg text-white text-3xl font-bold">
              📚
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">LibraryOS Enterprise</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Premium Workspace Plan</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Workspace Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Workspace ID</label>
                    <p className="text-gray-900 dark:text-white font-mono text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg inline-block">ws_5f8a9b2c3d4e</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Primary Region</label>
                    <p className="text-gray-900 dark:text-white font-medium flex items-center">
                      <span className="mr-2">🇮🇳</span> Asia Pacific (Mumbai)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created By</label>
                    <p className="text-gray-900 dark:text-white font-medium">{user?.name || 'Admin User'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Usage Statistics</h3>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Storage Used</span>
                      <span className="text-gray-500">4.2 GB / 10 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Active Members</span>
                      <span className="text-gray-500">12 / 50</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">API Calls (This Month)</span>
                      <span className="text-gray-500">8.5k / 100k</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '8.5%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Workspace;
