import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertTriangle, Mail, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AutomationSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    dailyFineAmount: 5,
    maxFineLimit: 100,
    enableEmailReminders: true,
    enableAutoBlock: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/v1/automation-settings');
      if (res.data.success && res.data.data) {
        setSettings({
          dailyFineAmount: res.data.data.dailyFineAmount || 5,
          maxFineLimit: res.data.data.maxFineLimit || 100,
          enableEmailReminders: res.data.data.enableEmailReminders ?? true,
          enableAutoBlock: res.data.data.enableAutoBlock ?? true
        });
      }
    } catch (error) {
      toast.error('Failed to load automation settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/v1/automation-settings', settings);
      if (res.data.success) {
        toast.success('Automation settings saved successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 dark:bg-[#0f1117] min-h-[calc(100vh-80px)] transition-colors animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header section with Glassmorphism */}
        <div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                Automation Rules Engine
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Configure how the system automatically handles overdue fines and member blocking.
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10 whitespace-nowrap"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Fine Settings */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl transition-colors">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800/60">
              <div className="p-3 bg-red-50 dark:bg-red-500/20 rounded-xl text-red-600 dark:text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Overdue Fines</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage penalty configurations for late returns.</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Daily Fine Amount (₹)
                </label>
                <input
                  type="number"
                  name="dailyFineAmount"
                  value={settings.dailyFineAmount}
                  onChange={handleChange}
                  min="0"
                  className="w-full md:w-2/3 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium"
                />
                <p className="text-xs text-gray-500 mt-2 font-medium">The amount charged automatically per day for late returns.</p>
              </div>
              
              <div className="bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Fine Limit (₹)
                </label>
                <input
                  type="number"
                  name="maxFineLimit"
                  value={settings.maxFineLimit}
                  onChange={handleChange}
                  min="0"
                  className="w-full md:w-2/3 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-gray-900 dark:text-white font-medium"
                />
                <p className="text-xs text-gray-500 mt-2 font-medium">Fine limit before auto-blocking kicks in (if enabled).</p>
              </div>
            </div>
          </div>

          {/* Action Settings */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl transition-colors">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800/60">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Auto Actions</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure automated member restriction and alerts.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors cursor-pointer group">
                <div className="pr-4">
                  <div className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Enable Auto-Block
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Automatically block members from issuing new books if their fine exceeds the maximum limit.
                  </div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    name="enableAutoBlock"
                    checked={settings.enableAutoBlock}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>

              <label className="flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors cursor-pointer group">
                <div className="pr-4 flex gap-3">
                  <Mail className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Send Email Reminders
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Automatically send due date reminders and overdue alerts via email.
                    </div>
                  </div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    name="enableEmailReminders"
                    checked={settings.enableEmailReminders}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AutomationSettings;
