import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions, useCreateRole } from "../../hooks/useRoles";
import { ArrowLeft, Save } from "lucide-react";

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
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return alert("Role name is required");
    createRole.mutate(
      { name, description, permissions: selectedPerms },
      { onSuccess: () => navigate("/roles") }
    );
  };

  if (isLoading) return <div className="p-10 text-center text-slate-500">Loading Permission Matrix...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create Custom Role</h1>
          <p className="text-slate-500">Define fine-grained access limits via the Permission Matrix.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
              <input 
                type="text" 
                required
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500" 
                placeholder="e.g. Senior Librarian"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500" 
                placeholder="What can this role do?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Permission Matrix</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(groupedPerms).map(([module, perms]) => {
              const allSelected = perms.every(p => selectedPerms.includes(p._id));
              
              return (
                <div key={module} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b">
                    <h4 className="font-bold text-slate-700">{module}</h4>
                    <label className="flex items-center gap-2 text-xs font-medium text-blue-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="accent-blue-600"
                        checked={allSelected}
                        onChange={(e) => handleSelectModule(perms, e.target.checked)}
                      />
                      Select All
                    </label>
                  </div>
                  <div className="space-y-2">
                    {perms.map(perm => (
                      <label key={perm._id} className="flex items-start gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="mt-1 accent-blue-600"
                          checked={selectedPerms.includes(perm._id)}
                          onChange={() => togglePermission(perm._id)}
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600">{perm.name}</p>
                          <p className="text-xs text-slate-500">{perm.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 flex justify-end">
          <button 
            type="submit" 
            disabled={createRole.isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70"
          >
            <Save size={18} /> {createRole.isLoading ? "Saving..." : "Save Role"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRole;
