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
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Member ID Cards</h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Manage digital and physical library cards.</p>
          </div>
          <Link to="/member-cards/generate" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center font-medium shadow-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Generate New Card
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">Total Issued</span>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCards}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">Active Cards</span>
              <span className="text-3xl font-bold text-green-600">{stats.activeCards}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">Expired</span>
              <span className="text-3xl font-bold text-yellow-600">{stats.expiredCards}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">Lost / Blocked</span>
              <span className="text-3xl font-bold text-red-600">{stats.lostCards}</span>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <div className="relative w-96">
              <input 
                type="text" 
                placeholder="Search by card number or member name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="p-4 font-medium">Card Number</th>
                    <th className="p-4 font-medium">Member</th>
                    <th className="p-4 font-medium">Issue Date</th>
                    <th className="p-4 font-medium">Expiry Date</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                  {filteredCards.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No ID cards found.
                      </td>
                    </tr>
                  ) : (
                    filteredCards.map(card => (
                      <tr key={card._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="p-4 font-mono font-medium text-gray-900 dark:text-white">{card.cardNumber}</td>
                        <td className="p-4">
                          <div className="flex items-center">
                            {card.memberId?.profileImage ? (
                              <img src={card.memberId.profileImage} alt="" className="w-8 h-8 rounded-full object-cover mr-3 bg-gray-100" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                                {card.memberId?.firstName?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{card.memberId?.firstName} {card.memberId?.lastName}</div>
                              <div className="text-xs text-gray-500">{card.memberId?.memberCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">
                          {new Date(card.issueDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">
                          {new Date(card.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                            card.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            card.status === 'EXPIRED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {card.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link to={`/member-cards/${card._id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium text-sm">
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
