import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get("/v1/roles");
      if (res.data.success) {
        setRoles(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Role Management</h1>
            <p className="text-gray-500 mt-1">Configure Enterprise Role-Based Access Control (RBAC).</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm font-medium flex items-center">
            Create Custom Role
          </button>
        </div>

        {loading ? (
          <div className="text-center p-10 text-gray-500">Loading Roles...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => (
              <div key={role._id} className="bg-white rounded-lg shadow border p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{role.name}</h3>
                  {role.isSystemRole && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">SYSTEM</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-6 min-h-[40px]">{role.description || "No description provided."}</p>
                
                <div className="border-t pt-4">
                  <div className="text-xs font-bold text-gray-400 uppercase mb-2">Permissions Overview</div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map(p => (
                        <span key={p._id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                          {p.code}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 italic">Unlimited Access / Custom Configuration</span>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="text-sm font-medium text-blue-600 hover:underline">Edit Permissions</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;
