import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { confirmAlert } from '../../utils/confirmAlert';

const UserDirectory = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
      if (res.data.success) {
        setRoles(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedRole(res.data.data[0]._id);
        } else {
          toast.error("No roles found. Please create one.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to fetch roles');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/v1/users");
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    if (!selectedRole) {
      toast.error("Please select a role first");
      return;
    }

    setIsInviting(true);
    try {
      const res = await api.post("/v1/users/invite", { 
        email: inviteEmail, 
        roleId: selectedRole 
      });
      const json = res.data;
      if (json.success) {
        toast.success(`Invitation created for ${inviteEmail}!`);
        if (json.inviteLink) {
          // Copy invite link to clipboard
          const fullLink = `${window.location.origin}${json.inviteLink}`;
          navigator.clipboard?.writeText(fullLink).catch(() => {});
          toast(`Invite link copied to clipboard: ${fullLink}`, { duration: 6000, icon: '🔗' });
        }
        setIsInviteModalOpen(false);
        setInviteEmail("");
        fetchUsers();
      } else {
        toast.error(json.message || "Failed to invite user");
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
      // Assuming a PUT /v1/users/:id endpoint exists
      const res = await api.put(`/v1/users/${editingUser._id}`, editFormData);
      if (res.data.success) {
        toast.success('User updated successfully');
        setIsEditModalOpen(false);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleSuspend = async (id) => {
    if (await confirmAlert('Are you sure you want to suspend this user?')) {
      try {
        await api.delete(`/v1/users/${id}`);
        toast.success('User suspended');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to suspend user');
      }
    }
  };

  const handleRestore = async (id) => {
    if (await confirmAlert('Are you sure you want to restore this user?')) {
      try {
        await api.put(`/v1/users/${id}/restore`);
        toast.success('User restored');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to restore user');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">User Directory</h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400">Manage library staff, roles, and departments (live).</p>
          </div>
          <button onClick={() => setIsInviteModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 font-bold flex items-center transition-all">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Invite User
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 overflow-hidden relative z-10">
          {loading ? (
            <div className="p-10 text-center text-gray-500 font-medium">Loading directory...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-gray-100 dark:divide-gray-700">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-white/90 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold">
                          {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name || "Pending Invite"}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-200">{user.roleId ? user.roleId.name : user.role}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{user.designation || "Staff"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-xs font-black rounded-lg shadow-sm border ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:border-green-700/50 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/50 dark:text-yellow-400'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.joiningDate || user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditClick(user)} className="px-3 py-1.5 bg-blue-50/50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors mr-2">Edit</button>
                      {user.status === 'SUSPENDED' ? (
                        <button onClick={() => handleRestore(user._id)} className="px-3 py-1.5 bg-green-50/50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg transition-colors">Restore</button>
                      ) : (
                        <button onClick={() => handleSuspend(user._id)} className="px-3 py-1.5 bg-red-50/50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors">Suspend</button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-4">👥</div>
                      No users found. Start building your team!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Premium Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity p-4 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-2xl dark:bg-gray-800/90 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-8 py-6 border-b border-gray-100/50 dark:border-gray-700/50 flex justify-between items-center bg-transparent">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Invite New User</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl font-semibold leading-none">&times;</button>
            </div>
            <form onSubmit={submitInvite} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" 
                  placeholder="colleague@library.com"
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">They will receive an email with instructions to join your workspace.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" 
                  required
                >
                  {roles.length === 0 ? (
                    <option value="">No roles found (Refresh page or create one)</option>
                  ) : (
                    <>
                      <option value="">-- Select a Role --</option>
                      {roles.map(role => (
                        <option key={role._id} value={role._id}>{role.name}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <button 
                  type="button" 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isInviting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isInviting ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity p-4 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-2xl dark:bg-gray-800/90 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-8 py-6 border-b border-gray-100/50 dark:border-gray-700/50 flex justify-between items-center bg-transparent">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit User</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl font-semibold leading-none">&times;</button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input 
                  type="text" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <select 
                  value={editFormData.roleId}
                  onChange={(e) => setEditFormData({...editFormData, roleId: e.target.value})}
                  className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" 
                >
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
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
