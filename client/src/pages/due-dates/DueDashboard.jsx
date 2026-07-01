import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ label, count, color, icon, to }) => (
  <Link to={to || '#'} className="block">
    <div className={`bg-white dark:bg-gray-800 rounded-xl border ${color} p-6 shadow-sm hover:shadow-md transition group`}>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-4xl font-black text-gray-900 dark:text-white">{count}</p>
        <span className="text-3xl opacity-80 group-hover:scale-110 transition-transform">{icon}</span>
      </div>
    </div>
  </Link>
);

const TransactionRow = ({ tx }) => {
  const isOverdue = tx.remainingDays < 0;
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-sm">
      <td className="p-4">
        <div className="font-bold text-gray-900 dark:text-white">{tx.member?.firstName} {tx.member?.lastName}</div>
        <div className="text-xs text-gray-400">{tx.member?.memberCode}</div>
      </td>
      <td className="p-4 font-medium text-gray-700 dark:text-gray-300">{tx.book?.title}</td>
      <td className="p-4 font-bold text-gray-900 dark:text-white">{new Date(tx.dueDate).toLocaleDateString()}</td>
      <td className="p-4">
        {isOverdue ? (
          <span className="text-red-600 font-bold dark:text-red-400">{tx.daysOverdue}d overdue</span>
        ) : (
          <span className={`font-bold ${tx.remainingDays <= 1 ? 'text-orange-500' : 'text-green-600 dark:text-green-400'}`}>
            {tx.remainingDays === 0 ? 'Due Today!' : `${tx.remainingDays}d left`}
          </span>
        )}
      </td>
    </tr>
  );
};

const DueDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dueToday');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/v1/due-dates/dashboard');
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error(`Error: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tabs = [
    { key: 'dueToday', label: 'Due Today', icon: '📅' },
    { key: 'dueTomorrow', label: 'Due Tomorrow', icon: '⏰' },
    { key: 'overdue', label: 'Overdue', icon: '🚨' },
    { key: 'dueThisWeek', label: 'This Week', icon: '📆' },
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">📅</span> Due Date Dashboard
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Monitor all active loans, due dates, and overdue books in real-time.</p>
          </div>
          <Link to="/due-dates/overdue" className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm flex items-center">
            <span className="mr-2">🚨</span> Overdue Books
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
        ) : data ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
              <StatCard label="Due Today" count={data.stats.dueTodayCount} color="border-orange-200 dark:border-orange-800" icon="📅" to="/due-dates" />
              <StatCard label="Due Tomorrow" count={data.stats.dueTomorrowCount} color="border-yellow-200 dark:border-yellow-800" icon="⏰" to="/due-dates" />
              <StatCard label="Overdue Books" count={data.stats.overdueCount} color="border-red-200 dark:border-red-800" icon="🚨" to="/due-dates/overdue" />
              <StatCard label="Pending Fines" count={data.stats.pendingFinesCount} color="border-purple-200 dark:border-purple-800" icon="💰" to="/fines" />
            </div>

            {/* Tab Switcher */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-4 text-sm font-bold transition ${
                      activeTab === tab.key
                        ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.icon} {tab.label}
                    <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                      {data[tab.key]?.length || 0}
                    </span>
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                      <th className="p-4 text-left font-medium">Member</th>
                      <th className="p-4 text-left font-medium">Book</th>
                      <th className="p-4 text-left font-medium">Due Date</th>
                      <th className="p-4 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {(data[activeTab] || []).length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-gray-400">
                          ✅ No books in this category
                        </td>
                      </tr>
                    ) : (
                      (data[activeTab] || []).map(tx => <TransactionRow key={tx._id} tx={tx} />)
                    )}
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

export default DueDashboard;
