import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RenewBook = () => {
  const navigate = useNavigate();
  const [memberCode, setMemberCode] = useState('');
  
  const [member, setMember] = useState(null);
  const [issuedBooks, setIssuedBooks] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [renewingId, setRenewingId] = useState(null);

  const handleMemberSearch = async (e) => {
    e.preventDefault();
    if (!memberCode) return;
    setLoading(true);
    try {
      const res = await api.get(`/v1/members?search=${memberCode}`);
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        const exactMember = res.data.data.find(m => m.memberCode === memberCode || m.memberCardNumber === memberCode) || res.data.data[0];
        setMember(exactMember);
        fetchIssuedBooks(exactMember._id);
        toast.success("Member loaded");
      } else {
        toast.error("Member not found.");
        setMember(null);
        setIssuedBooks([]);
      }
    } catch (error) {
      toast.error('Failed to load member');
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
        toast.success(`Book renewed! New Due Date: ${new Date(res.data.data.dueDate).toLocaleDateString()}`);
        // Refresh
        fetchIssuedBooks(member._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to renew book');
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">🔄</span> Renew Books
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Extend the borrowing period for active checkouts.</p>
          </div>
          <button onClick={() => navigate('/renewals/history')} className="px-6 py-3 bg-white/80 dark:bg-gray-800 backdrop-blur-md text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700 rounded-xl font-bold shadow-sm hover:shadow-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-all hover:-translate-y-0.5">
            View Renewal History
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 p-8 mb-8 relative z-10">
          <form onSubmit={handleMemberSearch} className="flex gap-4">
              <input 
                type="text" 
                placeholder="Scan or enter Member ID..." 
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                className="flex-1 px-6 py-4 border border-white/50 dark:border-gray-700 rounded-2xl bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg shadow-inner transition-all"
                required
              />
              <button type="submit" disabled={loading} className="px-10 py-4 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white rounded-2xl hover:from-black hover:to-gray-900 transition-all font-bold disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                {loading ? "Searching..." : "Find Member"}
              </button>
          </form>
        </div>

        {member && (
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 overflow-hidden relative z-10 animate-fade-in-up">
            <div className="p-8 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border-b border-white/50 dark:border-gray-700 flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">{member.firstName} {member.lastName}</h2>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2 bg-white/50 dark:bg-gray-800/50 inline-block px-3 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                  ID: <span className="font-bold">{member.memberCode}</span> | Status: <span className="font-black text-green-600 dark:text-green-400">{member.status}</span>
                </p>
              </div>
              <div className="text-right relative z-10 bg-white/60 dark:bg-gray-800/60 p-4 rounded-2xl border border-white/50 dark:border-gray-700 shadow-sm">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Active Checkouts</p>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400 leading-none">{issuedBooks.length}</p>
              </div>
            </div>

            <div className="p-0">
              {issuedBooks.length === 0 ? (
                <div className="p-16 text-center font-medium text-gray-400 dark:text-gray-500 bg-white/30 dark:bg-gray-800/30">
                  This member has no active books to renew.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-200 dark:border-gray-700">
                      <th className="p-5">Book</th>
                      <th className="p-5">Barcode</th>
                      <th className="p-5">Due Date</th>
                      <th className="p-5">Renewals</th>
                      <th className="p-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {issuedBooks.map(tx => {
                      const isOverdue = new Date(tx.dueDate) < new Date();
                      
                      return (
                        <tr key={tx._id} className="hover:bg-white/90 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 group">
                          <td className="p-5 font-extrabold text-gray-900 dark:text-white text-base group-hover:text-blue-600 transition-colors">{tx.bookId?.title}</td>
                          <td className="p-5 text-gray-500 dark:text-gray-400 font-mono text-sm font-medium">
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{tx.bookCopyId?.barcode}</span>
                          </td>
                          <td className="p-5">
                            <span className={`font-black text-base ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                              {new Date(tx.dueDate).toLocaleDateString()}
                            </span>
                            {isOverdue && <span className="ml-3 text-xs bg-red-50 text-red-700 border border-red-200 dark:border-red-800 dark:bg-red-900/30 px-2 py-1 font-bold rounded-md shadow-sm">OVERDUE</span>}
                          </td>
                          <td className="p-5 text-sm font-bold text-gray-600 dark:text-gray-300">
                            <span className="bg-white/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg shadow-sm">
                              {tx.renewalCount} <span className="text-gray-400">/</span> {tx.maxRenewals || 1}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            <button 
                              onClick={() => handleRenew(tx._id)}
                              disabled={renewingId === tx._id || tx.renewalCount >= (tx.maxRenewals || 1)}
                              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm border ${
                                tx.renewalCount >= (tx.maxRenewals || 1) 
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500' 
                                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent hover:from-blue-700 hover:to-indigo-700 hover:shadow-md hover:-translate-y-0.5'
                              }`}
                            >
                              {renewingId === tx._id ? 'Renewing...' : (tx.renewalCount >= (tx.maxRenewals || 1) ? 'Limit Reached' : 'Renew')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RenewBook;
