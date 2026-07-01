import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const NotificationBell = () => {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Get member ID (using user._id or user.memberId if mapped)
  const memberId = user?.memberId || user?._id; 

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/v1/notifications`);
      if (res.data.success) {
        const notifs = res.data.data.slice(0, 5); // take latest 5 for dropdown
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => n.status !== 'READ').length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Simple polling every 30s to simulate realtime
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [memberId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.put(`/v1/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'READ' } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return 'bg-green-100 text-green-600 💬';
      case 'WARNING': return 'bg-yellow-100 text-yellow-600 ⚠️';
      case 'ERROR': return 'bg-red-100 text-red-600 🚨';
      default: return 'bg-blue-100 text-blue-600 ℹ️';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="p-2 relative text-gray-500 hover:bg-gray-100 rounded-full dark:text-gray-400 dark:hover:bg-gray-700 transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/80">
            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                {unreadCount} New
              </span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map(notif => (
                  <div key={notif._id} className={`p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${notif.status !== 'READ' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIcon(notif.type)}`}>
                      {getIcon(notif.type).split(' ').pop()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold text-gray-900 dark:text-white ${notif.status !== 'READ' ? '' : 'font-medium'}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.sentAt).toLocaleString()}
                      </p>
                    </div>
                    {notif.status !== 'READ' && (
                      <button onClick={(e) => handleMarkAsRead(notif._id, e)} className="shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full" title="Mark as read" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-100 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-800/80">
            <Link 
              to="/notifications" 
              onClick={() => setOpen(false)}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View All Notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
