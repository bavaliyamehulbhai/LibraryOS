import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WhatsAppDashboard = () => {
  const [metrics, setMetrics] = useState({
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/v1/whatsapp/dashboard');
        if (res.data.success) {
          setMetrics(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load WhatsApp metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const totalAttempted = metrics.sent + metrics.failed;
  const deliveryRate = totalAttempted > 0 ? Math.round((metrics.delivered / totalAttempted) * 100) : 0;
  const readRate = metrics.delivered > 0 ? Math.round((metrics.read / metrics.delivered) * 100) : 0;

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3 text-green-500">💬</span> WhatsApp Dashboard
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Monitor high-engagement library notifications.</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-lg font-bold border border-green-200 dark:border-green-800 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Meta API Connected (Mock)
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Sent</p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white">{metrics.sent}</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Delivery Rate</p>
              <h2 className="text-4xl font-black text-green-600 dark:text-green-400">{deliveryRate}%</h2>
              <p className="text-sm text-gray-400 mt-1">{metrics.delivered} delivered</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Read Rate</p>
              <h2 className="text-4xl font-black text-blue-600 dark:text-blue-400">{readRate}%</h2>
              <p className="text-sm text-gray-400 mt-1">{metrics.read} read</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Failed</p>
              <h2 className="text-4xl font-black text-red-600 dark:text-red-400">{metrics.failed}</h2>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Why WhatsApp?</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-3xl">
            WhatsApp provides a 95%+ read rate compared to Email (20%). Use this channel for critical alerts like Overdue fines, OTP verification, and Reservation readiness. LibraryOS supports rich formatting and Interactive Quick Reply buttons for higher member engagement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppDashboard;
