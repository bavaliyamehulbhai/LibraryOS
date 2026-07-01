import React, { useState } from 'react';
import BrandingSettings from './BrandingSettings';
import RulesSettings from './RulesSettings';
import NotificationSettings from './NotificationSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('branding');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'branding':
        return <BrandingSettings />;
      case 'rules':
        return <RulesSettings />;
      case 'notifications':
        return <NotificationSettings />;
      default:
        return <BrandingSettings />;
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Library Settings</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button 
              className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'branding' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              onClick={() => setActiveTab('branding')}
            >
              Branding & White Label
            </button>
            <button 
              className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'rules' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              onClick={() => setActiveTab('rules')}
            >
              Borrowing & Fine Rules
            </button>
            <button 
              className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'notifications' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications & SMTP
            </button>
          </div>
          
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
