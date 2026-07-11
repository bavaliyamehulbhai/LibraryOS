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
    <div className="p-8 bg-gray-50/50 dark:bg-[#0f1117] min-h-[calc(100vh-80px)] transition-colors animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header section with Glassmorphism */}
        <div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-3xl text-white">📧</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                Email Dashboard
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Monitor your outgoing email communications and deliverability.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 relative z-10">Total Sent</p>
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 relative z-10">{metrics.sent}</h2>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 relative z-10">Open Rate</p>
              <div className="flex items-baseline gap-2 relative z-10">
                <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{openRate}%</h2>
              </div>
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500 mt-2 relative z-10">{metrics.opened} opened</p>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 relative z-10">Delivered</p>
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 relative z-10">{metrics.delivered}</h2>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 relative z-10">Failed</p>
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600 relative z-10">{metrics.failed}</h2>
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500 mt-2 relative z-10">{failureRate}% failure rate</p>
            </div>
          </div>
        )}

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">SMTP Configuration Status</h3>
          <div className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/50 p-6 rounded-2xl shadow-inner">
            <div className="p-3 bg-white dark:bg-green-800/50 rounded-xl shadow-sm">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-base font-extrabold text-green-800 dark:text-green-400">Ethereal Email (Test Environment) Active</p>
              <p className="text-sm font-medium text-green-700 dark:text-green-500 mt-1">Emails are being caught and preview links are generated in the server logs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDashboard;
