import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

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
      toast.error('Failed to load member details');
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
        toast.success(`Member is now ${newStatus}`);
        fetchMember();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleVerify = async () => {
    try {
      const res = await api.put(`/v1/members/${id}/verify`);
      if (res.data.success) {
        toast.success('Member verified successfully');
        fetchMember();
      }
    } catch (error) {
      toast.error('Failed to verify member');
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!member) {
    return <div className="p-8 text-center text-gray-500">Member not found</div>;
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-blue-700 text-white flex items-center justify-center text-3xl font-bold shadow-lg mr-6">
              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{member.firstName} {member.lastName}</h1>
                {member.isVerified ? (
                  <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 p-1 rounded-full" title="Verified Member">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 text-xs px-2 py-0.5 rounded font-medium">Unverified</span>
                )}
                <span className={`px-2 py-0.5 rounded text-xs font-medium tracking-wide ${
                    member.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    member.status === 'BLOCKED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {member.status}
                </span>
              </div>
              <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                <span>{member.memberCode}</span>
                <span>•</span>
                <span>{member.memberType}</span>
                <span>•</span>
                <span>{member.email}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 flex space-x-3">
            {!member.isVerified && (
              <button onClick={handleVerify} className="px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition border border-blue-200 dark:border-blue-800">
                Verify Identity
              </button>
            )}
            
            {member.status === 'ACTIVE' ? (
              <button onClick={() => handleStatusChange('BLOCKED')} className="px-4 py-2 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition border border-red-200 dark:border-red-800">
                Block Account
              </button>
            ) : (
              <button onClick={() => handleStatusChange('ACTIVE')} className="px-4 py-2 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition border border-green-200 dark:border-green-800">
                Unblock Account
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Checkouts</span>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{history.stats.activeCheckouts}</span>
            {member.membershipPlanId && (
              <span className="text-xs text-gray-400 mt-1">Limit: {member.membershipPlanId.maxBooksAllowed}</span>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pending Fines</span>
            <span className="text-3xl font-bold text-red-600">₹{history.fines.filter(f => f.paymentStatus === 'PENDING').reduce((acc, f) => acc + f.amount, 0)}</span>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Books Borrowed</span>
            <span className="text-3xl font-bold text-blue-600">{history.transactions.length}</span>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center justify-center">
            <button className="w-full py-3 bg-gray-900 text-white dark:bg-gray-700 rounded-lg font-bold flex items-center justify-center hover:bg-gray-800 transition">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Print ID Card
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px px-6 space-x-8">
              {['profile', 'transactions', 'fines'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Contact Details</h3>
                  <dl className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Email</dt>
                      <dd className="font-medium text-gray-900 dark:text-gray-200">{member.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Phone</dt>
                      <dd className="font-medium text-gray-900 dark:text-gray-200">{member.phone}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Gender</dt>
                      <dd className="font-medium text-gray-900 dark:text-gray-200">{member.gender}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Member Since</dt>
                      <dd className="font-medium text-gray-900 dark:text-gray-200">{new Date(member.createdAt).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Membership Plan</h3>
                  {member.membershipPlanId ? (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
                      <div className="font-bold text-gray-900 dark:text-white mb-1">{member.membershipPlanId.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Limits: {member.membershipPlanId.maxBooksAllowed} Books / {member.membershipPlanId.maxDaysAllowed} Days</div>
                      <div className="text-sm text-red-500 mt-2 font-medium">Fine Rate: ₹{member.membershipPlanId.finePerDay}/day</div>
                    </div>
                  ) : (
                    <div className="text-yellow-600 bg-yellow-50 p-4 rounded-lg text-sm border border-yellow-200">
                      No membership plan assigned. Member cannot borrow books.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Borrowing History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                        <th className="p-4 font-medium">Book</th>
                        <th className="p-4 font-medium">Issue Date</th>
                        <th className="p-4 font-medium">Due Date</th>
                        <th className="p-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {history.transactions.length === 0 ? (
                        <tr><td colSpan="4" className="p-6 text-center text-gray-500">No borrowing history.</td></tr>
                      ) : history.transactions.map(tx => (
                        <tr key={tx._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                          <td className="p-4">
                            <div className="font-medium text-gray-900 dark:text-white">{tx.bookId?.title}</div>
                            <div className="text-xs text-gray-500 font-mono">Barcode: {tx.bookCopyId?.barcode}</div>
                          </td>
                          <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{new Date(tx.issueDate).toLocaleDateString()}</td>
                          <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{new Date(tx.dueDate).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium tracking-wide ${
                              tx.status === 'ISSUED' ? 'bg-blue-100 text-blue-700' :
                              tx.status === 'RETURNED' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'fines' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Fine History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                        <th className="p-4 font-medium">Amount</th>
                        <th className="p-4 font-medium">Days Late</th>
                        <th className="p-4 font-medium">Generated On</th>
                        <th className="p-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {history.fines.length === 0 ? (
                        <tr><td colSpan="4" className="p-6 text-center text-gray-500">No fines found.</td></tr>
                      ) : history.fines.map(fine => (
                        <tr key={fine._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                          <td className="p-4 font-bold text-red-600">₹{fine.amount}</td>
                          <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{fine.daysLate} Days</td>
                          <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{new Date(fine.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium tracking-wide ${
                              fine.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {fine.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberDetails;
