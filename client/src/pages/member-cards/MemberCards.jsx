import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  CreditCard, Plus, Search, Filter, Eye, Printer, 
  ShieldCheck, AlertTriangle, Clock, CheckCircle2,
  Calendar, User
} from 'lucide-react';

const MemberCards = () => {
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  const filteredCards = cards.filter(c => {
    const matchesSearch = 
      c.cardNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.memberId?.firstName + ' ' + c.memberId?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.memberId?.memberCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Member ID Cards
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                PVC & QR Badges
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Issue, verify, replace, and print physical and digital patron access badges
            </p>
          </div>
        </div>

        <Link 
          to="/member-cards/generate" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Card</span>
        </Link>
      </div>

      {/* Telemetry KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Cards Issued</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalCards || 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Registry lifetime records</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Active Badges</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>{stats.activeCards || 0}</span>
            </div>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Eligible for physical circulation</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Expired Memberships</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>{stats.expiredCards || 0}</span>
            </div>
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">Requires renewal confirmation</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Lost / Blocked</div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>{stats.lostCards || 0}</span>
            </div>
            <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">Deactivated barcode security</p>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm overflow-hidden">
        
        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search by card barcode, member name, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-white/10 self-start sm:self-auto">
            {['ALL', 'ACTIVE', 'EXPIRED', 'LOST'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600/20 border-t-blue-600 mb-2"></div>
            <p className="text-xs text-slate-400">Loading card ledger...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-white/10 uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Card Serial</th>
                  <th className="px-5 py-3.5">Patron Member</th>
                  <th className="px-4 py-3.5">Issue Date</th>
                  <th className="px-4 py-3.5">Expiry Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredCards.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-400">
                      No member cards found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredCards.map(card => {
                    const isCardExpired = new Date() > new Date(card.expiryDate);
                    const currentStatus = isCardExpired && card.status === 'ACTIVE' ? 'EXPIRED' : card.status;
                    
                    return (
                      <tr 
                        key={card._id} 
                        className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200/80 dark:border-white/5">
                            {card.cardNumber}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {card.memberId?.profileImage && card.memberId.profileImage !== 'default-avatar.png' ? (
                              <img src={card.memberId.profileImage} alt="" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                                {card.memberId?.firstName?.charAt(0) || <User className="w-3.5 h-3.5" />}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {card.memberId?.firstName} {card.memberId?.lastName}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {card.memberId?.memberCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                          {new Date(card.issueDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                          {new Date(card.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider inline-flex items-center gap-1 ${
                            currentStatus === 'ACTIVE' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
                            currentStatus === 'EXPIRED' 
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' :
                              'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              currentStatus === 'ACTIVE' ? 'bg-emerald-500' :
                              currentStatus === 'EXPIRED' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}></span>
                            {currentStatus}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link 
                            to={`/member-cards/${card._id}`} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white transition font-semibold text-xs shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Card</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberCards;
