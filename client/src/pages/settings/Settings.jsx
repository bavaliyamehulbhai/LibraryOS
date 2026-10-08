import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import BrandingSettings from './BrandingSettings';
import RulesSettings from './RulesSettings';
import NotificationSettings from './NotificationSettings';
import AutomationSettings from './AutomationSettings';
import { Settings as SettingsIcon, Palette, Scale, Bell, Zap, Shield } from 'lucide-react';

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
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600/20 border-t-blue-600 mb-3"></div>
          <p className="text-xs text-slate-400">Loading configuration matrix...</p>
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
      case 'automation':
        return <AutomationSettings />;
      default:
        return <BrandingSettings initialData={settings} onSave={fetchSettings} />;
    }
  };

  const tabs = [
    { id: 'branding', label: 'Branding & White Label', icon: Palette, badge: 'Design' },
    { id: 'rules', label: 'Borrowing & Fine Rules', icon: Scale, badge: 'Policy' },
    { id: 'notifications', label: 'Notifications & SMTP', icon: Bell, badge: 'Comms' },
    { id: 'automation', label: 'Automation & CRON Rules', icon: Zap, badge: 'Engine' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="space-y-6">
        
        {/* Header section with Glassmorphism */}
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 text-white">
                <SettingsIcon className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Library Settings
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                    Tenant Config
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Configure branding, borrowing limits, automated notifications, and fine policies.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Multi-Tenant Encrypted</span>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="glass-card rounded-2xl shadow-sm border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden">
          {/* Tabs Bar */}
          <div className="flex border-b border-slate-200/80 dark:border-white/10 overflow-x-auto scrollbar-none bg-slate-50/50 dark:bg-slate-800/40">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  className={`flex items-center gap-2.5 px-6 py-4 font-bold text-xs transition-all duration-200 relative whitespace-nowrap ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900/90' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-slate-400'} transition-transform`} />
                  <span>{tab.label}</span>
                  
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' 
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>

                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_-2px_10px_rgba(37,99,235,0.5)]"></div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="p-6 md:p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
