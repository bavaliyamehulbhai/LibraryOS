import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, User, ShieldCheck, AlertCircle, Ban, 
  CheckCircle2, Printer, CreditCard, BookOpen, Clock, 
  Receipt, Phone, Mail, Calendar, Sparkles, ExternalLink 
} from 'lucide-react';
import { APP_VERSION } from '../../constants/version';

const MemberDetails = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/v1/members/${id}/history`);
      if (res.data.success) {
        setMember(res.data.data.member);
        setHistory(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load member dossier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.put(`/v1/members/${id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Patron status changed to ${newStatus}`);
        fetchMember();
      }
    } catch (error) {
      toast.error('Failed to update patron status');
    }
  };

  const handleVerify = async () => {
    try {
      const res = await api.put(`/v1/members/${id}/verify`);
      if (res.data.success) {
        toast.success('Patron identity certified & verified!');
        fetchMember();
      }
    } catch (error) {
      toast.error('Failed to verify member');
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 tracking-wider">RETRIEVING PATRON DOSSIER...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Patron Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">The requested patron ID does not exist in this library tenant.</p>
        <Link to="/members" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md">
          <ArrowLeft size={14} /> Back to Patrons
        </Link>
      </div>
    );
  }

  const pendingFines = history?.fines
    ? history.fines.filter(f => f.paymentStatus === 'PENDING').reduce((acc, f) => acc + f.amount, 0)
    : 0;

  const totalBorrowed = history?.transactions?.length || 0;
  const activeCheckouts = history?.stats?.activeCheckouts || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link 
              to="/members" 
              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition"
            >
              <ArrowLeft size={14} className="mr-1" />
              Patron Directory
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Patron Dossier
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{member.firstName} {member.lastName}</span>
            {member.isVerified && (
              <span title="Certified Institutional Patron">
                <ShieldCheck size={22} className="text-indigo-500 fill-indigo-500/20" />
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">
            {member.memberCode} • {member.memberType} • Enrolled {new Date(member.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrintCard}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200/80 dark:border-slate-700 transition"
          >
            <Printer size={15} />
            <span>Print ID Badge</span>
          </button>

          {!member.isVerified && (
            <button
              onClick={handleVerify}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 rounded-xl text-xs font-bold border border-indigo-500/20 transition"
            >
              <ShieldCheck size={15} />
              <span>Certify Identity</span>
            </button>
          )}

          {member.status === 'ACTIVE' ? (
            <button
              onClick={() => handleStatusChange('BLOCKED')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs font-bold border border-rose-500/20 transition"
            >
              <Ban size={15} />
              <span>Block Account</span>
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('ACTIVE')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold border border-emerald-500/20 transition"
            >
              <CheckCircle2 size={15} />
              <span>Unblock Account</span>
            </button>
          )}

          <Link
            to={`/issues/new?member=${member.memberCode}`}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
          >
            <BookOpen size={15} />
            <span>Check-out Book</span>
          </Link>
        </div>
      </div>

      {/* High-Density Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Checkouts */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Checkouts
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{activeCheckouts}</span>
            {member.membershipPlanId && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                / {member.membershipPlanId.maxBooksAllowed} max
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Current volumes in possession
          </div>
        </div>

        {/* Pending Fines */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Overdue Balance
            </span>
            <div className={`p-2 rounded-xl ${pendingFines > 0 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
              <Receipt size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${pendingFines > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              ₹{pendingFines}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {pendingFines > 0 ? 'Outstanding fine settlement needed' : 'Clear ledger — good standing'}
          </div>
        </div>

        {/* Lifetime Borrowed */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Lifetime Borrowed
            </span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalBorrowed}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">titles read</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Circulation history record
          </div>
        </div>

        {/* Account Standing */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Account Standing
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${
              member.status === 'ACTIVE'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : member.status === 'BLOCKED'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}>
              {member.status}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Tier: {member.membershipPlanId?.name || 'Standard Patron'}
          </div>
        </div>

      </div>

      {/* Tabs Layout */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden shadow-sm">
        <div className="border-b border-slate-200/60 dark:border-slate-800 px-6 flex items-center gap-6 overflow-x-auto">
          {[
            { id: 'profile', label: 'Patron Profile & Plan', icon: User },
            { id: 'transactions', label: `Circulation Ledger (${history?.transactions?.length || 0})`, icon: BookOpen },
            { id: 'fines', label: `Fines & Penalties (${history?.fines?.length || 0})`, icon: Receipt }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 sm:p-8">
          
          {/* TAB 1: Profile & Plan */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Contact & Bio Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                  Institutional Contact Information
                </h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Mail size={15} /> Email Address
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">{member.email}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Phone size={15} /> Phone Number
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">{member.phone || 'Not recorded'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <User size={15} /> Gender Identity
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">{member.gender || 'Not specified'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Calendar size={15} /> Registered Date
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">{new Date(member.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Membership Plan Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                  Assigned Borrowing Plan & Quota
                </h3>

                {member.membershipPlanId ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-slate-50 dark:from-indigo-950/30 dark:to-slate-900/50 border border-indigo-200/80 dark:border-indigo-800/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {member.membershipPlanId.name}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        Active Tier
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">Max Borrow Limit</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{member.membershipPlanId.maxBooksAllowed} Books</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">Loan Period</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{member.membershipPlanId.maxDaysAllowed} Days</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 col-span-2">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">Overdue Fine Rate</span>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">₹{member.membershipPlanId.finePerDay} per late day</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                    No membership plan is currently assigned to this patron. Book checkouts are restricted until a plan is attached.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: Circulation Ledger */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Borrowing & Return History</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Entries: {history?.transactions?.length || 0}</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">Book Title & Barcode</th>
                      <th className="px-4 py-3.5">Issue Date</th>
                      <th className="px-4 py-3.5">Due Date</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(!history?.transactions || history.transactions.length === 0) ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400">
                          No circulation transactions on record for this patron.
                        </td>
                      </tr>
                    ) : (
                      history.transactions.map(tx => (
                        <tr key={tx._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{tx.bookId?.title || 'Unknown Title'}</div>
                            <div className="text-[11px] text-slate-500 font-mono">Barcode: {tx.bookCopyId?.barcode || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-mono">
                            {new Date(tx.issueDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-mono">
                            {new Date(tx.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              tx.status === 'ISSUED'
                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                                : tx.status === 'RETURNED'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Link
                              to={`/issues/${tx._id}`}
                              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Fine History */}
          {activeTab === 'fines' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fine Records & Overdue Penalties</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Fines: {history?.fines?.length || 0}</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">Amount</th>
                      <th className="px-4 py-3.5">Days Late</th>
                      <th className="px-4 py-3.5">Generated On</th>
                      <th className="px-4 py-3.5">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(!history?.fines || history.fines.length === 0) ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-500 dark:text-slate-400">
                          No fines recorded. Patron has zero outstanding penalties.
                        </td>
                      </tr>
                    ) : (
                      history.fines.map(fine => (
                        <tr key={fine._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3.5 font-bold text-rose-600 dark:text-rose-400">
                            ₹{fine.amount}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                            {fine.daysLate || 0} Days
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-mono">
                            {new Date(fine.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              fine.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            }`}>
                              {fine.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default MemberDetails;
