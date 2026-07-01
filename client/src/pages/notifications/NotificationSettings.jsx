import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const { user } = useSelector((state) => state.auth);
  const [preferences, setPreferences] = useState({
    inAppEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const memberId = user?.memberId || user?._id;

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get(`/v1/notifications/member/${memberId}/preferences`);
        if (res.data.success) {
          setPreferences(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };
    if (memberId) fetchPrefs();
  }, [memberId]);

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/v1/notifications/member/${memberId}/preferences`, preferences);
      toast.success('Notification preferences updated');
    } catch (err) {
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const ToggleSwitch = ({ label, description, stateKey, icon }) => (
    <div className="flex items-start justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mb-4">
      <div className="flex gap-4">
        <div className="text-2xl mt-1">{icon}</div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">{label}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
      <label className="flex items-center cursor-pointer mt-2">
        <div className="relative">
          <input 
            type="checkbox" 
            className="sr-only" 
            checked={preferences[stateKey]}
            onChange={() => handleToggle(stateKey)}
          />
          <div className={`block w-10 h-6 rounded-full transition ${preferences[stateKey] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${preferences[stateKey] ? 'translate-x-4' : ''}`}></div>
        </div>
      </label>
    </div>
  );

  if (loading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">⚙️</span> Notification Preferences
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Choose how and where you want to be notified.</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6 flex gap-3">
          <span className="text-xl">ℹ️</span>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> Critical alerts (like account suspension or high fines) may bypass these preferences to ensure you receive important information.
          </p>
        </div>

        <ToggleSwitch 
          label="In-App Notifications" 
          description="Receive alerts in the notification bell inside LibraryOS." 
          stateKey="inAppEnabled" 
          icon="🔔" 
        />
        
        <ToggleSwitch 
          label="Email Notifications" 
          description="Receive due date reminders and fine receipts via email." 
          stateKey="emailEnabled" 
          icon="📧" 
        />
        
        <ToggleSwitch 
          label="SMS Notifications" 
          description="Get text messages for important updates and overdue alerts." 
          stateKey="smsEnabled" 
          icon="📱" 
        />
        
        <ToggleSwitch 
          label="WhatsApp Alerts" 
          description="Receive messages and automated replies on WhatsApp." 
          stateKey="whatsappEnabled" 
          icon="💬" 
        />

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
