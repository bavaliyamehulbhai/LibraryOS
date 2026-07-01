import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EmailDashboard = () => {
  const [metrics, setMetrics] = useState({
    sent: 0,
    delivered: 0,
    failed: 0,
    opened: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/v1/emails/dashboard');
        if (res.data.success) {
          setMetrics(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load email metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const openRate = metrics.sent > 0 ? Math.round((metrics.opened / metrics.sent) * 100) : 0;
  const failureRate = metrics.sent > 0 ? Math.round((metrics.failed / (metrics.sent + metrics.failed)) * 100) : 0;

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">📧</span> Email Dashboard
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Monitor your outgoing email communications and deliverability.</p>
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
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Open Rate</p>
              <h2 className="text-4xl font-black text-blue-600 dark:text-blue-400">{openRate}%</h2>
              <p className="text-sm text-gray-400 mt-1">{metrics.opened} opened</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Delivered</p>
              <h2 className="text-4xl font-black text-green-600 dark:text-green-400">{metrics.delivered}</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Failed</p>
              <h2 className="text-4xl font-black text-red-600 dark:text-red-400">{metrics.failed}</h2>
              <p className="text-sm text-gray-400 mt-1">{failureRate}% failure rate</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">SMTP Configuration Status</h3>
          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-bold">Ethereal Email (Test Environment) Active</p>
              <p className="text-sm">Emails are being caught and preview links are generated in the server logs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDashboard;
