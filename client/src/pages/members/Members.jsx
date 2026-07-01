import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await api.delete(`/v1/members/${id}`);
        toast.success('Member deleted');
        fetchMembers();
      } catch (error) {
        toast.error('Failed to delete member');
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Members Directory</h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Manage library members and their subscriptions</p>
          </div>
          <Link to="/members/new" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center font-medium shadow-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add New Member
          </Link>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Members</span>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.total}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Members</span>
              <span className="text-3xl font-bold text-green-600">{analytics.active}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Blocked Accounts</span>
              <span className="text-3xl font-bold text-red-600">{analytics.blocked}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">New This Month</span>
              <span className="text-3xl font-bold text-blue-600">{analytics.recent}</span>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <div className="relative w-72">
              <input 
                type="text" 
                placeholder="Search name, email, or code..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4 font-medium">Member</th>
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Plan</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
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
                    <tr key={member._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{member.firstName} {member.lastName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{member.memberCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900 dark:text-gray-200">{member.email}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{member.phone}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-medium tracking-wide">
                          {member.memberType}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                        {member.membershipPlanId ? member.membershipPlanId.name : <span className="italic text-gray-400">None</span>}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium tracking-wide ${
                          member.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          member.status === 'BLOCKED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-3 whitespace-nowrap">
                        <button onClick={() => handleEditClick(member)} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition">Edit</button>
                        <Link to={`/members/${member._id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition">View</Link>
                        <button onClick={() => handleDelete(member._id)} className="text-red-600 hover:text-red-800 text-sm font-medium transition">Delete</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Member</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">First Name</label>
                  <input type="text" value={editFormData.firstName} onChange={e => setEditFormData({...editFormData, firstName: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Last Name</label>
                  <input type="text" value={editFormData.lastName} onChange={e => setEditFormData({...editFormData, lastName: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone</label>
                <input type="text" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
