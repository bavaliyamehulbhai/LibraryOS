import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePermissions, useCreateRole } from "../../hooks/useRoles";
import { 
  ArrowLeft, Save, Shield, Key, CheckSquare, Square, 
  Sparkles, Layers, ShieldCheck, HelpCircle
} from "lucide-react";
import toast from "react-hot-toast";

const CreateRole = () => {
  const navigate = useNavigate();
  const { data: permData, isLoading } = usePermissions();
  const createRole = useCreateRole();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);

  const permissions = permData?.data || [];
  
  // Group permissions by module
  const groupedPerms = permissions.reduce((acc, perm) => {
    const mod = perm.module || "GENERAL";
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {});

  const togglePermission = (id) => {
    setSelectedPerms(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSelectModule = (modulePerms, checked) => {
    const ids = modulePerms.map(p => p._id);
    if (checked) {
      const newIds = ids.filter(id => !selectedPerms.includes(id));
      setSelectedPerms(prev => [...prev, ...newIds]);
    } else {
      setSelectedPerms(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  const handleSelectAll = (selectAll) => {
    if (selectAll) {
      setSelectedPerms(permissions.map(p => p._id));
    } else {
      setSelectedPerms([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Role identifier name is required");
      return;
    }

    createRole.mutate(
      { name: name.toUpperCase().replace(/\s+/g, '_'), description, permissions: selectedPerms },
      { 
        onSuccess: () => {
          toast.success("Custom role established successfully!");
          navigate("/roles");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Failed to create role");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
          <span className="text-sm font-medium">Loading RBAC Permission Matrix...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100 pb-24">
      
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
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Shield size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Create Custom IAM Role</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Granular Matrix
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Grant or restrict access to modules, actions, and system data.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSelectAll(selectedPerms.length !== permissions.length)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
          >
            {selectedPerms.length === permissions.length ? "Deselect All" : "Select All Capabilities"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Role Identity Details Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Key size={18} className="text-purple-500" />
            <span>Role Definition</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Role System Identifier
              </label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-purple-500 transition" 
                placeholder="e.g. INVENTORY_MANAGER"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Formatted as an immutable system token</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Human-Readable Description
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-purple-500 transition" 
                placeholder="e.g. Manages physical shelving, copies, and inventory audits."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Summarizes operational authority</span>
            </div>
          </div>
        </div>

        {/* Permission Modules Matrix */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Layers size={16} className="text-purple-500" />
              <span>Permission Matrix ({selectedPerms.length} Selected)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(groupedPerms).map(moduleName => {
              const modulePerms = groupedPerms[moduleName];
              const allSelected = modulePerms.every(p => selectedPerms.includes(p._id));
              const someSelected = modulePerms.some(p => selectedPerms.includes(p._id));

              return (
                <div 
                  key={moduleName} 
                  className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between"
                >
                  {/* Module Header */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                        {moduleName}
                      </h3>
                      <span className="text-xs text-slate-400">({modulePerms.length})</span>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-purple-600 dark:text-purple-400">
                      <input 
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => handleSelectModule(modulePerms, e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Select All</span>
                    </label>
                  </div>

                  {/* Permissions List */}
                  <div className="p-5 space-y-2.5 flex-1">
                    {modulePerms.map(perm => {
                      const isChecked = selectedPerms.includes(perm._id);
                      return (
                        <label 
                          key={perm._id}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                            isChecked
                              ? 'border-purple-500/50 bg-purple-50/50 dark:bg-purple-950/20 shadow-sm'
                              : 'border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(perm._id)}
                            className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 block">
                              {perm.action}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                              {perm.description || "Grants authority for this operational capability"}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Submit Bar */}
        <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPerms.length}</span> capabilities assigned to <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{name || "ROLE_TOKEN"}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/roles")}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createRole.isLoading || !name.trim()}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={14} />
              <span>{createRole.isLoading ? "Sealing Role..." : "Deploy Custom Role"}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};

export default CreateRole;
