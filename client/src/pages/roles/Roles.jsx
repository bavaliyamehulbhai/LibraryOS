import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useRoles, useDeleteRole } from "../../hooks/useRoles";
import { 
  Shield, Users, Trash2, Edit, Plus, Search, X, 
  Key, Lock, CheckCircle2, ShieldCheck, ArrowRight,
  ShieldAlert, Layers, Sparkles
} from "lucide-react";
import { confirmAlert } from "../../utils/confirmAlert";
import toast from "react-hot-toast";

const Roles = () => {
  const { data, isLoading } = useRoles();
  const deleteRole = useDeleteRole();
  const roles = data?.data || [];

  const [search, setSearch] = useState("");

  const handleDelete = async (id, name, isSystem) => {
    if (isSystem) {
      toast.error("System roles are protected and cannot be deleted.");
      return;
    }
    if (await confirmAlert(`Are you sure you want to permanently delete the role "${name}"?`)) {
      deleteRole.mutate(id, {
        onSuccess: () => toast.success(`Role ${name} deleted successfully!`),
        onError: (err) => toast.error(err.response?.data?.message || "Failed to delete role")
      });
    }
  };

  const filteredRoles = roles.filter(role => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (role.name || '').toLowerCase().includes(q) || (role.description || '').toLowerCase().includes(q);
  });

  const systemRolesCount = roles.filter(r => r.isSystem).length;
  const customRolesCount = roles.filter(r => !r.isSystem).length;
  const totalUsersAssigned = roles.reduce((acc, r) => acc + (r.userCount || 0), 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Shield size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Role & Access Control (RBAC)</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Granular IAM
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Define fine-grained permission matrices, administrative privileges, and security boundaries.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link 
            to="/roles/new" 
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Create Custom Role</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Roles</span>
            <Shield size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {roles.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Configured access tiers</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">System Sealed</span>
            <Lock size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {systemRolesCount}
          </div>
          <p className="text-[11px] text-blue-500 mt-1 font-medium">Core built-in security profiles</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Custom Roles</span>
            <Key size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {customRolesCount}
          </div>
          <p className="text-[11px] text-emerald-500 mt-1 font-medium">Tenant defined matrices</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Assigned Operators</span>
            <Users size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {totalUsersAssigned}
          </div>
          <p className="text-[11px] text-purple-500 mt-1 font-medium">Users with active roles</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search roles by title, permissions, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Roles Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
            <span className="text-sm font-medium">Loading RBAC security matrix...</span>
          </div>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="py-20 text-center space-y-2">
          <ShieldAlert size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300">No Roles Matching Query</h3>
          <p className="text-xs text-slate-400">Try adjusting your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map(role => (
            <div 
              key={role._id} 
              className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-purple-500/40 transition-all p-6 relative overflow-hidden flex flex-col justify-between group"
            >
              {role.isSystem && (
                <div className="absolute top-0 right-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-blue-500/20 font-mono tracking-wider flex items-center gap-1">
                  <Lock size={10} /> SYSTEM PROTECTED
                </div>
              )}
              
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Key size={18} />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {role.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[32px]">
                  {role.description || "Fine-grained role defining operational scope."}
                </p>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-center">
                  <span className="text-base font-extrabold text-purple-600 dark:text-purple-400 block leading-tight">
                    {role.permissions?.length || 0}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Permissions</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-center">
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 block leading-tight">
                    {role.userCount || 0}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Users</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs font-semibold">
                <Link 
                  to={`/roles/${role._id}`} 
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1.5 transition"
                >
                  <span>Inspect Matrix</span>
                  <ArrowRight size={13} />
                </Link>

                {!role.isSystem && (
                  <div className="flex items-center gap-2">
                    <button 
                      className={`p-1.5 rounded-lg border transition ${
                        role.userCount > 0 
                          ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-rose-300 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                      }`}
                      title={role.userCount > 0 ? "Cannot delete role assigned to active users" : "Delete Role"}
                      onClick={() => role.userCount === 0 && handleDelete(role._id, role.name, role.isSystem)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Roles;
