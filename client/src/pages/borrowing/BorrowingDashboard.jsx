import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const BorrowingDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/v1/borrowing-limits/dashboard');
        if (res.data.success) setStats(res.data.data);
      } catch (err) {
        toast.error('Failed to load borrowing stats');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">🏛</span> Borrowing Limits Dashboard
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Monitor library policy compliance and member borrowing health.</p>
          </div>
          <Link to="/borrowing/policies" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">
            ⚙ Manage Policies
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
        ) : stats ? (
          <>
            {/* Alert Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
              {[
                { label: 'Near Limit', value: stats.nearLimitCount, color: 'border-yellow-300 dark:border-yellow-700', icon: '⚠️', desc: 'Members at ≥80% of borrow limit' },
                { label: 'Blocked by Fine', value: stats.blockedByFineCount, color: 'border-red-300 dark:border-red-700', icon: '🚫', desc: 'Outstanding fines > ₹500' },
                { label: 'Overdue Members', value: stats.overdueMembers, color: 'border-orange-300 dark:border-orange-700', icon: '🚨', desc: 'Have unreturned overdue books' },
                { label: 'Active Plans', value: stats.totalActivePlans, color: 'border-green-300 dark:border-green-700', icon: '✅', desc: 'Membership tiers configured' },
              ].map(card => (
                <div key={card.label} className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 ${card.color}`}>
                  <p className="text-2xl mb-2">{card.icon}</p>
                  <p className="text-4xl font-black text-gray-900 dark:text-white">{card.value}</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-1">{card.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
                </div>
              ))}
            </div>

            {/* Policy Summary Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Policies Overview</h2>
                <p className="text-sm text-gray-400 mt-1">Current limits per membership tier</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                      <th className="p-4 font-medium">Plan</th>
                      <th className="p-4 font-medium text-center">📚 Books</th>
                      <th className="p-4 font-medium text-center">🔖 Reserves</th>
                      <th className="p-4 font-medium text-center">🔄 Renewals</th>
                      <th className="p-4 font-medium text-center">📅 Days</th>
                      <th className="p-4 font-medium text-center">💰 Fine/Day</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {stats.plans.map(plan => (
                      <tr key={plan._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="p-4">
                          <p className="font-bold text-gray-900 dark:text-white">{plan.name}</p>
                          <p className="text-xs text-gray-400">{plan.planType}</p>
                        </td>
                        <td className="p-4 text-center font-bold text-blue-600 dark:text-blue-400 text-lg">{plan.borrowLimit}</td>
                        <td className="p-4 text-center font-bold text-purple-600 dark:text-purple-400">{plan.reservationLimit}</td>
                        <td className="p-4 text-center font-bold text-green-600 dark:text-green-400">{plan.renewalLimit}</td>
                        <td className="p-4 text-center font-bold text-orange-600 dark:text-orange-400">{plan.issueDuration}d</td>
                        <td className="p-4 text-center font-bold text-red-600 dark:text-red-400">₹{plan.finePerDay}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default BorrowingDashboard;
