import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Bell, CheckCircle, Clock, Send, ShieldAlert, Book, Settings, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Announcement Form State for Super Admin
  const [announcement, setAnnouncement] = useState({ title: '', message: '', channel: 'IN_APP' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'READ' } : n));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcement.title || !announcement.message) return;

    setSubmitting(true);
    try {
      const res = await api.post('/notifications/bulk', announcement);
      if (res.data.success) {
        toast.success("Announcement broadcasted successfully!");
        setAnnouncement({ title: '', message: '', channel: 'IN_APP' });
        fetchNotifications(); // Refresh list to see the announcement
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'SYSTEM_ALERT': return <ShieldAlert className="w-6 h-6 text-red-500" />;
      case 'BOOK_DUE': return <Clock className="w-6 h-6 text-orange-500" />;
      case 'ANNOUNCEMENT': return <Info className="w-6 h-6 text-blue-500" />;
      default: return <Bell className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Bell className="w-6 h-6 mr-2 text-indigo-600" />
            Notification Center
          </h1>
          <p className="text-gray-500 mt-1">Manage your alerts, reminders, and announcements.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={markAllAsRead}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">All caught up!</h3>
                  <p className="text-gray-500">You have no new notifications.</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification._id} 
                    className={`p-4 flex gap-4 transition-colors ${notification.status !== 'READ' ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-medium ${notification.status !== 'READ' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className={`text-sm mt-1 ${notification.status !== 'READ' ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          {notification.channel}
                        </span>
                        {notification.status !== 'READ' && (
                          <button 
                            onClick={() => markAsRead(notification._id)}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium ml-2"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          
          {/* Super Admin Announcement Engine */}
          {user.role === 'SUPER_ADMIN' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Send className="w-5 h-5 mr-2 text-indigo-500" />
                Global Announcement
              </h3>
              <p className="text-sm text-gray-500 mb-4">Broadcast a message to all tenants across LibraryOS.</p>
              
              <form onSubmit={handleSendAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={announcement.title}
                    onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                    placeholder="e.g. Scheduled Maintenance"
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea
                    required
                    rows="3"
                    value={announcement.message}
                    onChange={(e) => setAnnouncement({...announcement, message: e.target.value})}
                    placeholder="Message content..."
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Channel Delivery</label>
                  <select
                    value={announcement.channel}
                    onChange={(e) => setAnnouncement({...announcement, channel: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="IN_APP">In-App Notification Only</option>
                    <option value="EMAIL">Email Broadcast</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Broadcast Alert'}
                </button>
              </form>
            </div>
          )}

          {/* User Preferences Stub */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
             <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-gray-500" />
                Preferences
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Email Notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">In-App Notifications</span>
                </label>
                <label className="flex items-center gap-3 opacity-50">
                  <input type="checkbox" disabled className="rounded text-indigo-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">SMS Alerts (Pro Plan)</span>
                </label>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotificationCenter;
