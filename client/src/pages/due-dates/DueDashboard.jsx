import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ label, count, color, icon, to }) => (
  <Link to={to || '#'} className="block h-full group">
    <div className={`bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl border border-white/50 ${color} p-8 shadow-lg hover:shadow-xl transition-all h-full flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 transform duration-300">
        <span className="text-6xl">{icon}</span>
      </div>
      <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 relative z-10">{label}</p>
      <div className="flex items-end justify-between relative z-10">
        <p className="text-5xl font-black text-gray-900 dark:text-white leading-none">{count}</p>
        <span className="text-3xl bg-white/50 dark:bg-gray-700/50 p-2 rounded-xl border border-white/50 dark:border-gray-600 shadow-sm">{icon}</span>
      </div>
    </div>
  </Link>
);

const TransactionRow = ({ tx }) => {
  const isOverdue = tx.remainingDays < 0;
  return (
    <tr className="hover:bg-white/90 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 group">
      <td className="p-5">
        <div className="font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{tx.member?.firstName} {tx.member?.lastName}</div>
        <div className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 inline-block px-2 py-0.5 rounded mt-1">{tx.member?.memberCode}</div>
      </td>
      <td className="p-5 font-bold text-gray-700 dark:text-gray-300">{tx.book?.title}</td>
      <td className="p-5 font-black text-gray-900 dark:text-white">{new Date(tx.dueDate).toLocaleDateString()}</td>
      <td className="p-5">
        {isOverdue ? (
          <span className="inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 animate-pulse">
            {tx.daysOverdue}d overdue
          </span>
        ) : (
          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm border ${tx.remainingDays <= 1 ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400'}`}>
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
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">📅</span> Due Date Dashboard
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Monitor all active loans, due dates, and overdue books in real-time.</p>
          </div>
          <Link to="/due-dates/overdue" className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center hover:-translate-y-0.5">
            <span className="mr-2">🚨</span> Overdue Books
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
        ) : data ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 relative z-10">
              <StatCard label="Due Today" count={data.stats.dueTodayCount} color="dark:border-gray-700" icon="📅" to="/due-dates" />
              <StatCard label="Due Tomorrow" count={data.stats.dueTomorrowCount} color="dark:border-gray-700" icon="⏰" to="/due-dates" />
              <StatCard label="Overdue Books" count={data.stats.overdueCount} color="dark:border-gray-700" icon="🚨" to="/due-dates/overdue" />
              <StatCard label="Pending Fines" count={data.stats.pendingFinesCount} color="dark:border-gray-700" icon="💰" to="/fines" />
            </div>

            {/* Tab Switcher */}
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 overflow-hidden relative z-10">
              <div className="flex border-b border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-5 text-sm font-black transition-all uppercase tracking-wider ${
                      activeTab === tab.key
                        ? 'bg-white dark:bg-gray-800 border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="mr-2 text-lg">{tab.icon}</span> {tab.label}
                    <span className={`ml-3 text-xs px-2.5 py-1 rounded-lg border ${
                      activeTab === tab.key 
                        ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' 
                        : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                    }`}>
                      {data[tab.key]?.length || 0}
                    </span>
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white/30 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                      <th className="p-5 text-left">Member</th>
                      <th className="p-5 text-left">Book</th>
                      <th className="p-5 text-left">Due Date</th>
                      <th className="p-5 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
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
