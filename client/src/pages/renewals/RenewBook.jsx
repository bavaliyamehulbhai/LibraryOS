import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  RotateCw, Search, X, User, BookOpen, AlertCircle, 
  CheckCircle2, Clock, ArrowRight, Sparkles, Barcode,
  Calendar, Layers, ShieldCheck
} from 'lucide-react';

const RenewBook = () => {
  const navigate = useNavigate();
  const [memberCode, setMemberCode] = useState('');
  const [member, setMember] = useState(null);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renewingId, setRenewingId] = useState(null);
  const [batchRenewing, setBatchRenewing] = useState(false);

  const handleMemberSearch = async (e) => {
    if (e) e.preventDefault();
    const query = memberCode.trim();
    if (!query) return;

    setLoading(true);
    try {
      const res = await api.get(`/v1/members?search=${encodeURIComponent(query)}`);
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        const exactMember = res.data.data.find(m => 
          m.memberCode?.toLowerCase() === query.toLowerCase() || 
          m.memberCardNumber?.toLowerCase() === query.toLowerCase()
        ) || res.data.data[0];

        setMember(exactMember);
        await fetchIssuedBooks(exactMember._id);
        toast.success(`Loaded patron: ${exactMember.firstName || ''} ${exactMember.lastName || ''}`);
      } else {
        toast.error("Patron not found with this code.");
        setMember(null);
        setIssuedBooks([]);
      }
    } catch {
      toast.error('Failed to load patron account');
    } finally {
      setLoading(false);
    }
  };

  const fetchIssuedBooks = async (memberId) => {
    try {
      const res = await api.get(`/v1/issues?memberId=${memberId}&status=ISSUED`);
      if (res.data.success) {
        const allIssues = res.data.data || [];
        const memberIssues = allIssues.filter(tx => {
          const txMemberId = tx.memberId?._id || tx.memberId;
          return String(txMemberId) === String(memberId) && (tx.status === 'ISSUED' || tx.status === 'RENEWED');
        });
        setIssuedBooks(memberIssues);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenew = async (transactionId) => {
    setRenewingId(transactionId);
    try {
      const res = await api.post('/v1/renewals', { transactionId });
      if (res.data.success) {
        const newDue = res.data.data?.dueDate ? new Date(res.data.data.dueDate).toLocaleDateString() : 'Extended';
        toast.success(`Book renewed successfully! New due date: ${newDue}`);
        if (member?._id) {
          fetchIssuedBooks(member._id);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to renew book');
    } finally {
      setRenewingId(null);
    }
  };

  const handleRenewAllEligible = async () => {
    const eligible = issuedBooks.filter(tx => (tx.renewalCount || 0) < (tx.maxRenewals || 1));
    if (eligible.length === 0) {
      toast.error("No books eligible for renewal");
      return;
    }

    setBatchRenewing(true);
    let successCount = 0;
    for (const tx of eligible) {
      try {
        const res = await api.post('/v1/renewals', { transactionId: tx._id });
        if (res.data.success) successCount++;
      } catch {
        // continue best effort
      }
    }
    setBatchRenewing(false);
    toast.success(`Batch renewal complete: ${successCount} of ${eligible.length} renewed`);
    if (member?._id) {
      fetchIssuedBooks(member._id);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <RotateCw size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Circulation Renewals Desk</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  v2.0 Titanium
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Extend borrowing loan windows for active checkouts adhering to circulation policy limits.
              </p>
            </div>
          </div>
        </div>

        <Link 
          to="/renewals/history" 
          className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition flex items-center gap-2"
        >
          <Clock size={15} />
          <span>Renewal History Archive</span>
        </Link>
      </div>

      {/* Patron Scanner Input */}
      <div className="p-6 md:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Lookup Patron Account
        </label>
        
        <form onSubmit={handleMemberSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Barcode className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Scan barcode or enter Member ID / Card No..." 
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-blue-500 outline-none transition"
              required
            />
            {memberCode && (
              <button 
                type="button" 
                onClick={() => { setMemberCode(''); setMember(null); setIssuedBooks([]); }}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="px-8 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Search size={16} />
                <span>Find Patron</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Member Details & Active Checkouts Card */}
      {member && (
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in space-y-6 p-6 md:p-8">
          
          {/* Patron Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                {(member.firstName || 'P')[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {member.firstName} {member.lastName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  <span>ID: <strong className="text-slate-800 dark:text-slate-200">{member.memberCode}</strong></span>
                  <span>•</span>
                  <span>Card: <strong className="text-slate-800 dark:text-slate-200">{member.memberCardNumber || 'N/A'}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-center">
                <span className="block text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Active Checkouts</span>
                <span className="text-xl font-black text-blue-700 dark:text-blue-300">{issuedBooks.length}</span>
              </div>

              {issuedBooks.length > 1 && (
                <button
                  onClick={handleRenewAllEligible}
                  disabled={batchRenewing}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCw size={14} className={batchRenewing ? "animate-spin" : ""} />
                  <span>Renew All Eligible</span>
                </button>
              )}
            </div>
          </div>

          {/* Book List Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <BookOpen size={16} className="text-blue-500" />
                <span>Active Loans Pending Renewal</span>
              </h3>
            </div>

            {issuedBooks.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300">No Active Book Loans</h4>
                <p className="text-xs">This member has no books checked out currently to renew.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-slate-800">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Book Title</th>
                      <th className="px-5 py-3.5">Barcode</th>
                      <th className="px-5 py-3.5">Current Due Date</th>
                      <th className="px-5 py-3.5">Renewal Quota</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                    {issuedBooks.map(tx => {
                      const isOverdue = new Date(tx.dueDate) < new Date();
                      const maxRen = tx.maxRenewals || 1;
                      const currentRen = tx.renewalCount || 0;
                      const isExhausted = currentRen >= maxRen;

                      return (
                        <tr key={tx._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900 dark:text-white text-sm max-w-xs truncate" title={tx.bookId?.title}>
                              {tx.bookId?.title || "Untitled Book"}
                            </div>
                            <div className="text-xs text-slate-400">
                              {tx.bookId?.author || tx.bookId?.authors?.join(", ") || "Unknown Author"}
                            </div>
                          </td>

                          <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                              {tx.bookCopyId?.barcode || 'N/A'}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-extrabold text-sm ${
                                isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                              }`}>
                                {new Date(tx.dueDate).toLocaleDateString()}
                              </span>
                              {isOverdue && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              isExhausted 
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            }`}>
                              {currentRen} / {maxRen} used
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleRenew(tx._id)}
                              disabled={renewingId === tx._id || isExhausted}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                isExhausted
                                  ? 'bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
                              }`}
                            >
                              {renewingId === tx._id ? (
                                <span className="flex items-center gap-1.5">
                                  <RotateCw size={12} className="animate-spin" /> Renewing...
                                </span>
                              ) : isExhausted ? (
                                'Limit Reached'
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <RotateCw size={12} /> Extend Loan
                                </span>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default RenewBook;
