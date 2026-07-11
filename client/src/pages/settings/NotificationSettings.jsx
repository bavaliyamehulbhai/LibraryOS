import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Save, Mail, Server } from 'lucide-react';

const NotificationSettings = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    overdueReminder: true,
    dueReminder: true,
    smtpHost: '',
    smtpPort: '',
    smtpEmail: '',
    smtpPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        emailNotifications: initialData.emailNotifications ?? true,
        smsNotifications: initialData.smsNotifications ?? false,
        overdueReminder: initialData.overdueReminder ?? true,
        dueReminder: initialData.dueReminder ?? true,
        smtpHost: initialData.smtpHost || '',
        smtpPort: initialData.smtpPort || '',
        smtpEmail: initialData.smtpEmail || '',
        smtpPassword: initialData.smtpPassword || ''
      });
    }
  }, [initialData]);

  const handleToggle = (name) => {
    setFormData({ ...formData, [name]: !formData[name] });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/v1/settings/notifications", formData);
      toast.success("Notification settings saved successfully");
      if (onSave) onSave();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl animate-fade-in">
      
      {/* Toggles */}
      <div className="bg-white dark:bg-gray-800/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Communication Channels</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enable or disable global notification channels.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors">
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-gray-100">Email Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Send transaction receipts and alerts via Email.</p>
            </div>
            <button type="button" onClick={() => handleToggle('emailNotifications')} className={`${formData.emailNotifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}>
              <span className={`${formData.emailNotifications ? 'translate-x-5' : 'translate-x-0'} inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors">
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-gray-100">Automated Due Reminders</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Send a warning email 1 day before the book is due.</p>
            </div>
            <button type="button" onClick={() => handleToggle('dueReminder')} className={`${formData.dueReminder ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}>
              <span className={`${formData.dueReminder ? 'translate-x-5' : 'translate-x-0'} inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Custom SMTP Configuration</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Use your own mail server to send emails to students (White-labeling).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">SMTP Host</label>
            <input type="text" name="smtpHost" value={formData.smtpHost} onChange={handleChange} placeholder="smtp.mailgun.org" 
              className="block w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">SMTP Port</label>
            <input type="text" name="smtpPort" value={formData.smtpPort} onChange={handleChange} placeholder="587" 
              className="block w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">SMTP Email (Sender)</label>
            <input type="email" name="smtpEmail" value={formData.smtpEmail} onChange={handleChange} placeholder="library@yourdomain.com" 
              className="block w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">SMTP Password</label>
            <input type="password" name="smtpPassword" value={formData.smtpPassword} onChange={handleChange} 
              className="block w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none" />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <Save className="w-5 h-5" />
          {loading ? "Saving..." : "Save Notification Settings"}
        </button>
      </div>
    </form>
  );
};

export default NotificationSettings;
