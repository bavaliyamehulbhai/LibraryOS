import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const RiskAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/v1/analytics/risk');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load risk analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;
  if (!data) return <div className="text-center p-12 text-gray-500">No data available</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">⚠️</span> Risk Analytics
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Identify members with high outstanding fines or late return patterns.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500 to-rose-600 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-red-500/30">
            <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
            <p className="text-red-100 font-bold uppercase tracking-wider mb-2 relative z-10">Total Outstanding Fines</p>
            <h2 className="text-5xl font-black mb-2 flex items-baseline relative z-10">
              <span className="text-3xl mr-1 font-bold">₹</span>
              {data.totalOutstandingAmount ? data.totalOutstandingAmount.toLocaleString() : 0}
            </h2>
            <p className="text-red-100 text-sm relative z-10">Revenue locked in unpaid fines.</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-center hover:shadow-md transition-shadow group">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-xl flex items-center">
              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 p-2 rounded-lg mr-3">🔔</span>
              Action Required
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
              Send SMS/WhatsApp payment reminders to members with high outstanding balances to improve collection rates.
            </p>
            <button 
              onClick={() => navigate('/notifications/settings')}
              className="px-6 py-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 text-red-700 dark:text-red-400 font-bold rounded-xl w-fit border border-red-200 dark:border-red-800/50 hover:scale-105 transition transform shadow-sm"
            >
              Configure Reminders
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800/80 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3 text-red-600 dark:text-red-500">🚨</div>
              High Risk Members (Top Fine Offenders)
            </h3>
          </div>
          <div className="p-0">
            {data.fineRisks && data.fineRisks.length > 0 ? (
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4">Member Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Unpaid Fine Count</th>
                    <th className="px-6 py-4">Total Unpaid Amount</th>
                    <th className="px-6 py-4">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.fineRisks.map((risk) => (
                    <tr key={risk._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{risk.name}</td>
                      <td className="px-6 py-4 text-xs">{risk.email}</td>
                      <td className="px-6 py-4 font-bold">{risk.fineCount}</td>
                      <td className="px-6 py-4 font-bold text-red-600 dark:text-red-400">₹{risk.totalUnpaid.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {risk.totalUnpaid > 500 ? (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold border border-red-200">HIGH RISK</span>
                        ) : risk.totalUnpaid > 100 ? (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold border border-yellow-200">MEDIUM RISK</span>
                        ) : (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold border border-green-200">LOW RISK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center">
                <span className="text-4xl">🎉</span>
                <p className="mt-4 text-gray-500 font-bold">No High Risk Members Found</p>
                <p className="text-sm text-gray-400">All members have cleared their fines!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalytics;
