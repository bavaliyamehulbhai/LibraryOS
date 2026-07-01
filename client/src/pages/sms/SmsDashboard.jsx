import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SmsDashboard = () => {
  const [metrics, setMetrics] = useState({
    sent: 0,
    delivered: 0,
    failed: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/v1/sms/dashboard');
        if (res.data.success) {
          setMetrics(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load SMS metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const totalAttempted = metrics.sent + metrics.failed + metrics.pending;
  const deliveryRate = totalAttempted > 0 ? Math.round((metrics.delivered / totalAttempted) * 100) : 0;

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">📱</span> SMS Dashboard
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Monitor your SMS communications and delivery rates.</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Sent</p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white">{metrics.sent}</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Delivery Rate</p>
              <h2 className="text-4xl font-black text-green-600 dark:text-green-400">{deliveryRate}%</h2>
              <p className="text-sm text-gray-400 mt-1">{metrics.delivered} delivered</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Pending</p>
              <h2 className="text-4xl font-black text-yellow-600 dark:text-yellow-400">{metrics.pending}</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Failed</p>
              <h2 className="text-4xl font-black text-red-600 dark:text-red-400">{metrics.failed}</h2>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Provider Status</h3>
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-4 rounded-lg">
            <span className="text-xl">ℹ️</span>
            <div>
              <p className="font-bold">MOCK Provider Active (Development Mode)</p>
              <p className="text-sm">SMS messages are being logged to the server console instead of being sent to real phones to save costs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmsDashboard;
