import React, { useState } from 'react';
import api from '../../services/api';

const NotificationSettings = () => {
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
      alert("Notification settings saved successfully");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
      
      {/* Toggles */}
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Communication Channels</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Send transaction receipts and alerts via Email</p>
            </div>
            <button type="button" onClick={() => handleToggle('emailNotifications')} className={`${formData.emailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}>
              <span className={`${formData.emailNotifications ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Automated Due Reminders</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Send a warning email 1 day before the book is due</p>
            </div>
            <button type="button" onClick={() => handleToggle('dueReminder')} className={`${formData.dueReminder ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}>
              <span className={`${formData.dueReminder ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-8 transition-colors">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Custom SMTP Configuration</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Use your own mail server to send emails to students (White-labeling).</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SMTP Host</label>
            <input type="text" name="smtpHost" value={formData.smtpHost} onChange={handleChange} placeholder="smtp.mailgun.org" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SMTP Port</label>
            <input type="text" name="smtpPort" value={formData.smtpPort} onChange={handleChange} placeholder="587" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SMTP Email (Sender)</label>
            <input type="email" name="smtpEmail" value={formData.smtpEmail} onChange={handleChange} placeholder="library@yourdomain.com" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SMTP Password</label>
            <input type="password" name="smtpPassword" value={formData.smtpPassword} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 font-medium transition-colors disabled:opacity-50">
          {loading ? "Saving..." : "Save Notification Settings"}
        </button>
      </div>
    </form>
  );
};

export default NotificationSettings;
