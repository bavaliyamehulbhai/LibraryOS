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
      if (res.data.success && res.data.data.members.length > 0) {
        const exactMember = res.data.data.members.find(m => m.memberCode === memberCode || m.memberCardNumber === memberCode);
        if (exactMember) {
          setMember(exactMember);
          fetchIssuedBooks(exactMember._id);
          toast.success("Member loaded");
        } else {
          toast.error("Member not found with this exact code.");
          setMember(null);
          setIssuedBooks([]);
        }
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
      // Find active transactions for this member
      const res = await api.get(`/v1/issues?memberId=${memberId}&status=ISSUED`);
      if (res.data.success) {
        // We will just filter client side since the API returns all for library if memberId not supported
        // But let's assume we can filter by memberId. 
        // Actually, we should just fetch all issues and filter, or add query support.
        const allIssues = res.data.data;
        const memberIssues = allIssues.filter(tx => tx.memberId._id === memberId && (tx.status === 'ISSUED' || tx.status === 'RENEWED'));
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
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">🔄</span> Renew Books
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Extend the borrowing period for active checkouts.</p>
          </div>
          <button onClick={() => navigate('/renewals/history')} className="text-blue-600 hover:underline dark:text-blue-400">
            View Renewal History
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <form onSubmit={handleMemberSearch} className="flex gap-4">
            <input 
              type="text" 
              placeholder="Scan or enter Member ID..." 
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg"
              required
            />
            <button type="submit" disabled={loading} className="px-8 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-bold disabled:opacity-50">
              {loading ? "Searching..." : "Find Member"}
            </button>
          </form>
        </div>

        {member && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{member.firstName} {member.lastName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID: {member.memberCode} | Status: <span className="font-bold text-green-600">{member.status}</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-500 uppercase">Active Checkouts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{issuedBooks.length}</p>
              </div>
            </div>

            <div className="p-0">
              {issuedBooks.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                  This member has no active books to renew.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                      <th className="p-4 font-medium">Book</th>
                      <th className="p-4 font-medium">Barcode</th>
                      <th className="p-4 font-medium">Due Date</th>
                      <th className="p-4 font-medium">Renewals</th>
                      <th className="p-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {issuedBooks.map(tx => {
                      const isOverdue = new Date(tx.dueDate) < new Date();
                      
                      return (
                        <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                          <td className="p-4 font-bold text-gray-900 dark:text-white">{tx.bookId?.title}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-300 font-mono text-sm">{tx.bookCopyId?.barcode}</td>
                          <td className="p-4">
                            <span className={`font-bold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                              {new Date(tx.dueDate).toLocaleDateString()}
                            </span>
                            {isOverdue && <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">OVERDUE</span>}
                          </td>
                          <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                            {tx.renewalCount} / {tx.maxRenewals || 1}
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleRenew(tx._id)}
                              disabled={renewingId === tx._id || tx.renewalCount >= (tx.maxRenewals || 1)}
                              className={`px-4 py-2 rounded font-bold text-sm transition ${
                                tx.renewalCount >= (tx.maxRenewals || 1) 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
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
