import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { confirmAlert } from '../../utils/confirmAlert';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editFormData, setEditFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/v1/members?page=${page}&search=${searchQuery}`);
      if (res.data.success) {
        setMembers(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/v1/members/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMembers();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, page]);

  const handleEditClick = (member) => {
    setEditingMember(member);
    setEditFormData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      phone: member.phone || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/v1/members/${editingMember._id}`, editFormData);
      if (res.data.success) {
        toast.success('Member updated successfully');
        setIsEditModalOpen(false);
        fetchMembers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update member');
    }
  };

  const handleSuspend = async (id) => {
    if (await confirmAlert('Are you sure you want to suspend this member?')) {
      try {
        await api.put(`/v1/members/${id}/status`, { status: 'SUSPENDED' });
        toast.success('Member suspended successfully');
        fetchMembers();
      } catch (error) {
        toast.error('Failed to suspend member');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Members Directory</h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Manage library members and their subscriptions</p>
          </div>
          <Link to="/members/new" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center font-bold">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add New Member
          </Link>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 relative z-10">
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 flex flex-col hover:-translate-y-1 transition-transform">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Total Members</span>
              <span className="text-4xl font-black text-gray-900 dark:text-white mt-1">{analytics.total}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 flex flex-col hover:-translate-y-1 transition-transform">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Active Members</span>
              <span className="text-4xl font-black text-green-600 dark:text-green-400 mt-1">{analytics.active}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 flex flex-col hover:-translate-y-1 transition-transform">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Blocked Accounts</span>
              <span className="text-4xl font-black text-red-600 dark:text-red-400 mt-1">{analytics.blocked}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 flex flex-col hover:-translate-y-1 transition-transform">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">New This Month</span>
              <span className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-1">{analytics.recent}</span>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 overflow-hidden relative z-10">
          <div className="p-6 border-b border-gray-100/50 dark:border-gray-700/50 flex justify-between items-center bg-transparent">
            <div className="relative w-96">
              <input 
                type="text" 
                placeholder="Search name, email, or code..." 
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/50 border-b border-gray-100 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                <tr>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-transparent">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">Loading members...</td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">No members found.</td>
                  </tr>
                ) : (
                  members.map(member => (
                    <tr key={member._id} className="hover:bg-white/90 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-black mr-4 shadow-inner flex-shrink-0">
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{member.firstName} {member.lastName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{member.memberCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{member.email}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{member.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100/80 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold tracking-wider shadow-sm border border-gray-200 dark:border-gray-600">
                          {member.memberType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                        {member.membershipPlanId ? member.membershipPlanId.name : <span className="italic text-gray-400">None</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wider shadow-sm border ${
                          member.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:border-green-700/50 dark:text-green-400' :
                          member.status === 'BLOCKED' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-400' :
                          member.status === 'SUSPENDED' ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:border-gray-700/50 dark:text-gray-400' :
                          'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/50 dark:text-yellow-400'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => handleEditClick(member)} className="px-3 py-1.5 bg-blue-50/50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors font-bold text-sm">Edit</button>
                        <Link to={`/members/${member._id}`} className="px-3 py-1.5 bg-indigo-50/50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors font-bold text-sm inline-block">View</Link>
                        {member.status !== 'SUSPENDED' && (
                          <button onClick={() => handleDelete(member._id)} className="px-3 py-1.5 bg-red-50/50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors font-bold text-sm">Suspend</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-2xl dark:bg-gray-800/90 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/50 dark:border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Edit Member</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-gray-300">First Name</label>
                  <input type="text" value={editFormData.firstName} onChange={e => setEditFormData({...editFormData, firstName: e.target.value})} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-gray-300">Last Name</label>
                  <input type="text" value={editFormData.lastName} onChange={e => setEditFormData({...editFormData, lastName: e.target.value})} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-gray-300">Email</label>
                <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-gray-300">Phone</label>
                <input type="text" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" />
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/50">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
