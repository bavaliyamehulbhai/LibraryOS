import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { confirmAlert } from '../../utils/confirmAlert';
import { 
  Users, UserPlus, Shield, Search, X, 
  Mail, Edit3, UserX, UserCheck, Download, 
  CheckCircle2, Sparkles, Building2, KeyRound 
} from 'lucide-react';
import { APP_VERSION } from '../../constants/version';

const UserDirectory = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  
  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', roleId: '' });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/v1/roles');
      if (res.data.success && Array.isArray(res.data.data)) {
        setRoles(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedRole(res.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch roles', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/v1/users");
      if (res.data.success && Array.isArray(res.data.data)) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  };

  const submitInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    if (!selectedRole) {
      toast.error("Please select an authorization role first");
      return;
    }

    setIsInviting(true);
    try {
      const res = await api.post("/v1/users/invite", { 
        email: inviteEmail.trim(), 
        roleId: selectedRole 
      });
      const json = res.data;
      if (json.success) {
        toast.success(`Invitation created for ${inviteEmail}!`);
        if (json.inviteLink) {
          const fullLink = `${window.location.origin}${json.inviteLink}`;
          navigator.clipboard?.writeText(fullLink).catch(() => {});
          toast(`Invite link copied: ${fullLink}`, { duration: 6000, icon: '🔗' });
        }
        setIsInviteModalOpen(false);
        setInviteEmail("");
        fetchUsers();
      } else {
        toast.error(json.message || "Failed to invite operator");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred sending invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({ 
      name: user.name || '', 
      roleId: user.roleId?._id || user.roleId || selectedRole
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/v1/users/${editingUser._id}`, editFormData);
      if (res.data.success) {
        toast.success('User credentials updated successfully');
        setIsEditModalOpen(false);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleSuspend = async (id) => {
    if (await confirmAlert('Are you sure you want to suspend this staff operator?')) {
      try {
        await api.delete(`/v1/users/${id}`);
        toast.success('Operator access suspended');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to suspend operator');
      }
    }
  };

  const handleRestore = async (id) => {
    if (await confirmAlert('Are you sure you want to restore access for this operator?')) {
      try {
        await api.put(`/v1/users/${id}/restore`);
        toast.success('Operator access restored');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to restore operator');
      }
    }
  };

  const exportCSV = () => {
    if (filteredUsers.length === 0) {
      toast.error('No operator records to export');
      return;
    }
    const headers = ['Name', 'Email', 'Role', 'Status', 'Joined Date'];
    const rows = filteredUsers.map(u => [
      `"${u.name || 'Pending Invite'}"`,
      `"${u.email}"`,
      `"${u.roleId?.name || u.role || 'Staff'}"`,
      `"${u.status || 'ACTIVE'}"`,
      `"${new Date(u.createdAt).toISOString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `libraryos_team_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Operator roster exported to CSV');
  };

  // KPIs
  const totalStaff = users.length;
  const activeStaff = users.filter(u => u.status === 'ACTIVE').length;
  const suspendedStaff = users.filter(u => u.status === 'SUSPENDED').length;

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.roleId?.name || user.role || '').toLowerCase().includes(searchTerm.toLowerCase());

    const userRole = user.roleId?.name || user.role || '';
    const matchesRole = selectedRoleFilter === 'ALL' || userRole.toUpperCase() === selectedRoleFilter.toUpperCase();

    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Staff & IAM Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="text-indigo-600 dark:text-indigo-400" size={28} />
            Institutional Staff Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage library staff operators, assign access tiers, and dispatch cryptographically secure invitations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200/80 dark:border-slate-700 transition"
          >
            <Download size={15} />
            <span>Export Roster</span>
          </button>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <UserPlus size={16} />
            <span>Invite Operator</span>
          </button>
        </div>
      </div>

      {/* Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Operators
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{totalStaff}</div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Registered staff & administrators</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Operators
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeStaff}</div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Granted active terminal permissions</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Suspended / Revoked
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <UserX size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">{suspendedStaff}</div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Terminal access revoked</div>
        </div>

      </div>

      {/* Toolbar: Search + Role Filter Chips */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search operators by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 transition"
          />
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")} 
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN'].map(role => (
            <button
              key={role}
              onClick={() => setSelectedRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedRoleFilter === role
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {role.replace('_', ' ')}
            </button>
          ))}
        </div>

      </div>

      {/* Operators Table */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">SYNCHRONIZING OPERATOR ROSTER...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Security Tier</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Enrolled On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="text-4xl mb-3">👥</div>
                      No operators found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const initials = (user.name ? user.name.slice(0, 2) : 'OP').toUpperCase();
                    return (
                      <tr key={user._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-xs shadow-sm">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {user.name || "Pending Registration"}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Shield size={14} className="text-indigo-500" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {user.roleId?.name || user.role || 'Staff'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {user.designation || 'Library Operator'}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}>
                            {user.status || 'ACTIVE'}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono">
                          {new Date(user.createdAt || user.joiningDate).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition"
                          >
                            Edit
                          </button>
                          {user.status === 'SUSPENDED' ? (
                            <button
                              onClick={() => handleRestore(user._id)}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/20 transition"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspend(user._id)}
                              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold border border-rose-500/20 transition"
                            >
                              Suspend
                            </button>
                          )}
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

      {/* Invite Operator Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus size={20} className="text-indigo-600 dark:text-indigo-400" />
                Invite Staff Operator
              </h3>
              <button 
                onClick={() => setIsInviteModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={submitInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="librarian@institution.edu"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    required
                    autoFocus
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Recipient receives an institutional access key and on-boarding credentials.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Access Privilege Tier <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  required
                >
                  {roles.length === 0 ? (
                    <option value="">No custom roles configured</option>
                  ) : (
                    roles.map(role => (
                      <option key={role._id} value={role._id}>{role.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isInviting}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
                >
                  {isInviting ? "Transmitting..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Operator Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 size={20} className="text-indigo-600 dark:text-indigo-400" />
                Edit Operator Profile
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Assigned Security Tier
                </label>
                <select 
                  value={editFormData.roleId}
                  onChange={(e) => setEditFormData({...editFormData, roleId: e.target.value})}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                >
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDirectory;
