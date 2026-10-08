import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Bell, CheckCircle, Clock, Send, ShieldAlert, Book, 
  Settings, Info, Filter, Search, X, CheckCheck, Megaphone,
  Radio, Sparkles, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  
  // Announcement Form State for Super Admin / Admin
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
        setNotifications(res.data.data || []);
      }
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'READ' } : n));
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcement.title.trim() || !announcement.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/notifications/bulk', announcement);
      if (res.data.success) {
        toast.success("Broadcast dispatched successfully!");
        setAnnouncement({ title: '', message: '', channel: 'IN_APP' });
        fetchNotifications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to broadcast announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'SYSTEM_ALERT': 
        return (
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
            <ShieldAlert size={18} />
          </div>
        );
      case 'BOOK_DUE': 
        return (
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <Clock size={18} />
          </div>
        );
      case 'ANNOUNCEMENT': 
        return (
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
            <Megaphone size={18} />
          </div>
        );
      default: 
        return (
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
            <Bell size={18} />
          </div>
        );
    }
  };

  const unreadCount = notifications.filter(n => n.status !== 'READ').length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'UNREAD' && n.status === 'READ') return false;
    if (activeTab === 'SYSTEM' && n.type !== 'SYSTEM_ALERT') return false;
    if (activeTab === 'DUE' && n.type !== 'BOOK_DUE') return false;
    if (activeTab === 'ANNOUNCEMENTS' && n.type !== 'ANNOUNCEMENT') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = (n.title || '').toLowerCase().includes(q);
      const matchMsg = (n.message || '').toLowerCase().includes(q);
      return matchTitle || matchMsg;
    }
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Bell size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Notification Center</h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white shadow-sm">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Centralized dispatch log for automated due reminders, security alerts, and campus announcements.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/announcements"
            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
          >
            <Megaphone size={15} className="text-orange-500" />
            <span>Manage Broadcasts</span>
          </Link>

          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <CheckCheck size={16} />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Notifications Stream (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search alerts, subjects, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
              {[
                { id: 'ALL', label: 'All Alerts', count: notifications.length },
                { id: 'UNREAD', label: 'Unread', count: unreadCount },
                { id: 'DUE', label: 'Book Due Dates', count: notifications.filter(n => n.type === 'BOOK_DUE').length },
                { id: 'SYSTEM', label: 'System Alerts', count: notifications.filter(n => n.type === 'SYSTEM_ALERT').length },
                { id: 'ANNOUNCEMENTS', label: 'Announcements', count: notifications.filter(n => n.type === 'ANNOUNCEMENT').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notification List Container */}
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                  <span className="text-sm font-medium">Fetching notifications...</span>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-20 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={24} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">You're completely caught up!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No active notifications matching this category. We will notify you when books are due or alerts fire.
                </p>
                {search && (
                  <button
                    onClick={() => { setSearch(''); setActiveTab('ALL'); }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredNotifications.map(notification => {
                  const isUnread = notification.status !== 'READ';
                  return (
                    <div 
                      key={notification._id} 
                      className={`p-4 md:p-5 flex items-start gap-4 transition-all group ${
                        isUnread 
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30' 
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {getIcon(notification.type)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                            )}
                            <h4 className={`text-sm font-bold truncate ${
                              isUnread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {notification.title}
                            </h4>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className={`text-xs mt-1 leading-relaxed ${
                          isUnread ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {notification.message}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              {notification.channel || 'IN_APP'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Type: {notification.type || 'GENERAL'}
                            </span>
                          </div>

                          {isUnread && (
                            <button 
                              onClick={() => markAsRead(notification._id)}
                              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition"
                            >
                              <CheckCircle size={13} />
                              <span>Mark read</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Dispatch & Preferences (1 Col) */}
        <div className="space-y-6">
          
          {/* Quick Broadcast Console (Admin Only) */}
          {(user?.role === 'SUPER_ADMIN' || user?.role === 'LIBRARY_ADMIN') && (
            <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Send size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Quick Broadcast</h3>
                  <p className="text-xs text-slate-400">Dispatch immediate announcement</p>
                </div>
              </div>
              
              <form onSubmit={handleSendAnnouncement} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={announcement.title}
                    onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                    placeholder="e.g. System Maintenance Notice"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Message Body
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={announcement.message}
                    onChange={(e) => setAnnouncement({...announcement, message: e.target.value})}
                    placeholder="Message will be broadcast to all patrons and staff..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Delivery Vector
                  </label>
                  <select
                    value={announcement.channel}
                    onChange={(e) => setAnnouncement({...announcement, channel: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  >
                    <option value="IN_APP">In-App Alert Stream</option>
                    <option value="EMAIL">Email Dispatch</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{submitting ? 'Broadcasting...' : 'Broadcast to Campus'}</span>
                </button>
              </form>
            </div>
          )}

          {/* User Preferences Card */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
             <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
               <div className="p-2 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400">
                 <Settings size={18} />
               </div>
               <div>
                 <h3 className="font-bold text-slate-900 dark:text-white text-base">Alert Preferences</h3>
                 <p className="text-xs text-slate-400">Configure your channel routing</p>
               </div>
             </div>

             <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">In-App Notifications</span>
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Email Digest & Due Alerts</span>
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 opacity-60">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">SMS Critical Alerts (Enterprise)</span>
                  <input type="checkbox" disabled className="rounded text-indigo-600" />
                </label>
             </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default NotificationCenter;
