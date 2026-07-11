import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MemberCards = () => {
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/member-cards');
      if (res.data.success) {
        setCards(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load member cards');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/v1/member-cards/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCards();
    fetchStats();
  }, []);

  const filteredCards = cards.filter(c => 
    c.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.memberId?.firstName + ' ' + c.memberId?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.memberId?.memberCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Member ID Cards</h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Manage digital and physical library cards.</p>
          </div>
          <Link to="/member-cards/generate" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center font-bold">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Generate New Card
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 flex flex-col hover:-translate-y-1 transition-transform">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider block">Total Issued</span>
              <span className="text-4xl font-black text-gray-900 dark:text-white mt-1">{stats.totalCards}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 flex flex-col hover:-translate-y-1 transition-transform">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider block">Active Cards</span>
              <span className="text-4xl font-black text-green-600 dark:text-green-400 mt-1">{stats.activeCards}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 flex flex-col hover:-translate-y-1 transition-transform">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider block">Expired</span>
              <span className="text-4xl font-black text-yellow-600 dark:text-yellow-400 mt-1">{stats.expiredCards}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 flex flex-col hover:-translate-y-1 transition-transform">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider block">Lost / Blocked</span>
              <span className="text-4xl font-black text-red-600 dark:text-red-400 mt-1">{stats.lostCards}</span>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 overflow-hidden relative z-10 mt-6">
          <div className="p-6 border-b border-gray-100/50 dark:border-gray-700/50 flex justify-between items-center bg-transparent">
            <div className="relative w-96">
              <input 
                type="text" 
                placeholder="Search by card number or member name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/50 border-b border-gray-100 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                    <th className="px-6 py-4">Card Number</th>
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Issue Date</th>
                    <th className="px-6 py-4">Expiry Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-transparent">
                  {filteredCards.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium">
                        No ID cards found.
                      </td>
                    </tr>
                  ) : (
                    filteredCards.map(card => (
                      <tr key={card._id} className="hover:bg-white/90 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">{card.cardNumber}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {card.memberId?.profileImage && card.memberId.profileImage !== 'default-avatar.png' ? (
                              <img src={card.memberId.profileImage} alt="" className="w-10 h-10 rounded-full object-cover mr-4 shadow-sm" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-black mr-4 shadow-inner">
                                {card.memberId?.firstName?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">{card.memberId?.firstName} {card.memberId?.lastName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.memberId?.memberCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                          {new Date(card.issueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                          {new Date(card.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wider shadow-sm border ${
                            card.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:border-green-700/50 dark:text-green-400' :
                            card.status === 'EXPIRED' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/50 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-400'
                          }`}>
                            {card.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/member-cards/${card._id}`} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:shadow-md rounded-xl text-sm font-bold transition-all inline-block">
                            View Card
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberCards;
