import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useRoles, useDeleteRole } from "../../hooks/useRoles";
import { Shield, Users, Trash2, Edit, Plus } from "lucide-react";

const Roles = () => {
  const { data, isLoading } = useRoles();
  const deleteRole = useDeleteRole();
  const roles = data?.data || [];

  const handleDelete = (id, name, isSystem) => {
    if (isSystem) return alert("System roles cannot be deleted.");
    if (window.confirm(`Are you sure you want to delete the role ${name}?`)) {
      deleteRole.mutate(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-blue-500" /> Role & Permission Management
          </h1>
          <p className="text-slate-500">Configure access levels and granular permissions.</p>
        </div>
        <Link to="/roles/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2">
          <Plus size={18} /> Create Custom Role
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-400">Loading roles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map(role => (
            <div key={role._id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-5 relative overflow-hidden">
              {role.isSystem && (
                <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                  SYSTEM
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800">{role.name}</h3>
                <p className="text-sm text-slate-500 min-h-[40px]">{role.description || "No description provided."}</p>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg flex items-center gap-2 flex-1 justify-center border border-blue-100">
                  <Shield size={16} />
                  <div className="text-center">
                    <p className="text-xs font-bold leading-none">{role.permissions?.length || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider opacity-80 mt-1">Permissions</p>
                  </div>
                </div>
                <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg flex items-center gap-2 flex-1 justify-center border border-green-100">
                  <Users size={16} />
                  <div className="text-center">
                    <p className="text-xs font-bold leading-none">{role.userCount || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider opacity-80 mt-1">Users</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <Link to={`/roles/${role._id}`} className="text-blue-600 hover:underline text-sm font-medium">
                  View Matrix
                </Link>
                {!role.isSystem && (
                  <div className="flex gap-2">
                    <button className="text-slate-400 hover:text-blue-600 p-1" title="Edit Role">
                      <Edit size={16} />
                    </button>
                    <button 
                      className={`p-1 ${role.userCount > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-red-600'}`} 
                      title={role.userCount > 0 ? "Cannot delete role in use" : "Delete Role"}
                      onClick={() => role.userCount === 0 && handleDelete(role._id, role.name, role.isSystem)}
                    >
                      <Trash2 size={16} />
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
