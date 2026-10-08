import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { confirmAlert } from '../../utils/confirmAlert';
import { 
  Users, UserCheck, UserX, UserPlus, Search, 
  Edit, Eye, ShieldAlert, X, ChevronLeft, ChevronRight 
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';

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
    }, 400);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Community & Identity
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Members Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage patrons, active subscriptions, digital member cards, and borrowing privileges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/members/new" 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <UserPlus size={16} />
            <span>Add New Member</span>
          </Link>
        </div>
      </div>

      {/* Analytics KPI Row */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            title="Total Members" 
            value={analytics.total} 
            icon={Users} 
            colorClass="text-indigo-600 dark:text-indigo-400"
            bgColorClass="bg-indigo-50 dark:bg-indigo-950/60"
            subtitle="Registered patrons"
          />
          <StatCard 
            title="Active Members" 
            value={analytics.active} 
            icon={UserCheck} 
            colorClass="text-emerald-600 dark:text-emerald-400"
            bgColorClass="bg-emerald-50 dark:bg-emerald-950/60"
            subtitle="Good standing"
            trend="+12%"
            trendDirection="up"
          />
          <StatCard 
            title="Suspended / Blocked" 
            value={analytics.blocked} 
            icon={UserX} 
            colorClass="text-rose-600 dark:text-rose-400"
            bgColorClass="bg-rose-50 dark:bg-rose-950/60"
            subtitle="Overdue or restricted"
          />
          <StatCard 
            title="New This Month" 
            value={analytics.recent} 
            icon={UserPlus} 
            colorClass="text-sky-600 dark:text-sky-400"
            bgColorClass="bg-sky-50 dark:bg-sky-950/60"
            subtitle="Monthly growth"
            trend="+8%"
            trendDirection="up"
          />
        </div>
      )}

      {/* Main Members Directory Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        
        {/* Search Toolbar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <input 
              type="text" 
              placeholder="Search by name, email, or member code..." 
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-5 py-3.5">Member</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Plan</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p className="text-xs font-semibold text-slate-400">Loading directory...</p>
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
                        <Users size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">No members found</h4>
                      <p className="text-xs text-slate-400 mt-1">Try another search term or onboard a new member.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                members.map(member => (
                  <tr key={member._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm shadow-indigo-600/20">
                          {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {member.memberCode || "No Code"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{member.email}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{member.phone || "—"}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                        {member.memberType || "STANDARD"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {member.membershipPlanId ? member.membershipPlanId.name : <span className="italic text-slate-400">None</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        member.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-400' :
                        member.status === 'BLOCKED' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400' :
                        member.status === 'SUSPENDED' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:border-amber-800/60 dark:text-amber-400' :
                        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {member.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link 
                          to={`/members/${member._id}`} 
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </Link>
                        <button 
                          onClick={() => handleEditClick(member)} 
                          className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Edit Member"
                        >
                          <Edit size={16} />
                        </button>
                        {member.status !== 'SUSPENDED' && (
                          <button 
                            onClick={() => handleSuspend(member._id)} 
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Suspend Member"
                          >
                            <ShieldAlert size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800/80 flex justify-between items-center text-xs">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <span className="text-slate-500 dark:text-slate-400">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Edit Member Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Member Details</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">First Name</label>
                  <input type="text" value={editFormData.firstName} onChange={e => setEditFormData({...editFormData, firstName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Last Name</label>
                  <input type="text" value={editFormData.lastName} onChange={e => setEditFormData({...editFormData, lastName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Email</label>
                <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Phone</label>
                <input type="text" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;

