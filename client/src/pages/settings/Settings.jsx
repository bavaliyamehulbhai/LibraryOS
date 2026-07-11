import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import BrandingSettings from './BrandingSettings';
import RulesSettings from './RulesSettings';
import NotificationSettings from './NotificationSettings';
import { Settings as SettingsIcon, Palette, Scale, Bell } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('branding');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/settings');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'branding':
        return <BrandingSettings initialData={settings} onSave={fetchSettings} />;
      case 'rules':
        return <RulesSettings initialData={settings} onSave={fetchSettings} />;
      case 'notifications':
        return <NotificationSettings initialData={settings} onSave={fetchSettings} />;
      default:
        return <BrandingSettings initialData={settings} onSave={fetchSettings} />;
    }
  };

  const tabs = [
    { id: 'branding', label: 'Branding & White Label', icon: Palette },
    { id: 'rules', label: 'Borrowing & Fine Rules', icon: Scale },
    { id: 'notifications', label: 'Notifications & SMTP', icon: Bell },
  ];

  return (
    <div className="p-8 bg-gray-50/50 dark:bg-[#0f1117] min-h-screen transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header section with Glassmorphism */}
        <div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                Library Settings
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Configure your library's core identity, rules, and communications.
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-800 overflow-hidden transition-colors">
          <div className="flex border-b border-gray-100 dark:border-gray-800/60 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  className={`flex items-center gap-2 px-8 py-5 font-bold text-sm transition-all duration-300 relative whitespace-nowrap ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-full shadow-[0_-2px_10px_rgba(79,70,229,0.5)]"></div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
