import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRoles } from "../../hooks/useRoles";
import { 
  ArrowLeft, Shield, Users, Key, Lock, CheckCircle2, 
  Layers, User, Mail, Search, X
} from "lucide-react";
import api from "../../services/api";

const RoleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: rolesData, isLoading } = useRoles();
  
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [permSearch, setPermSearch] = useState("");

  const role = rolesData?.data?.find(r => r._id === id);

  useEffect(() => {
    if (role) {
      api.get(`/v1/users?roleId=${id}`)
        .then(res => {
          setUsers(res.data?.data || []);
          setLoadingUsers(false);
        })
        .catch(() => setLoadingUsers(false));
    }
  }, [id, role]);

  if (isLoading || !role) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
          <span className="text-sm font-medium">Loading IAM Role Profile...</span>
        </div>
      </div>
    );
  }

  const filteredPerms = (role.permissions || []).filter(perm => {
    if (!permSearch.trim()) return true;
    const q = permSearch.toLowerCase();
    return (perm.name || '').toLowerCase().includes(q) || 
           (perm.action || '').toLowerCase().includes(q) || 
           (perm.module || '').toLowerCase().includes(q) ||
           (perm.description || '').toLowerCase().includes(q);
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link 
            to="/roles" 
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1.5 mb-2 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Role Management</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {role.name}
            </h1>
            {role.isSystem && (
              <span className="px-2.5 py-0.5 text-xs font-bold font-mono rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
                <Lock size={11} /> SYSTEM SEALED
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {role.description || "Custom operational security clearance matrix."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center gap-2 shadow-sm">
            <Shield size={14} className="text-purple-500" />
            <span>{role.permissions?.length || 0} Capabilities Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Granted Permissions (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Shield size={18} className="text-purple-500" />
                <span>Granted Permission Scopes</span>
              </h2>

              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Filter permissions..."
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
                {permSearch && (
                  <button onClick={() => setPermSearch('')} className="absolute right-2 top-2 text-slate-400 p-0.5">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {filteredPerms.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">No matching permissions found in this role profile.</p>
            ) : (
              <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {filteredPerms.map(perm => (
                  <div 
                    key={perm._id} 
                    className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-purple-500/30 transition"
                  >
                    <div>
                      <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {perm.action || perm.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {perm.description || "Operational permission token"}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                      {perm.module || 'SYSTEM'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Operators Assigned (1 Col) */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden p-6 flex flex-col max-h-[660px]">
            <h2 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Users size={18} className="text-emerald-500" />
              <span>Assigned Operators ({users.length})</span>
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-2.5">
              {loadingUsers ? (
                <div className="py-12 text-center text-slate-400 text-xs">Loading assigned personnel...</div>
              ) : users.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <User size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs">No users currently bound to this role profile.</p>
                </div>
              ) : (
                users.map(u => (
                  <div key={u._id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {(u.name || "U")[0].toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default RoleDetails;
