import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRoles } from "../../hooks/useRoles";
import { ArrowLeft, Shield, Users } from "lucide-react";
import api from "../../services/api";

const RoleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: rolesData, isLoading } = useRoles();
  
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const role = rolesData?.data?.find(r => r._id === id);

  useEffect(() => {
    if (role) {
      // Fetch users assigned to this role (using userDirectory routes theoretically, or a custom one)
      api.get(`/v1/users?roleId=${id}`)
        .then(res => {
          setUsers(res.data?.data || []);
          setLoadingUsers(false);
        })
        .catch(() => setLoadingUsers(false)); // Just fail gracefully if endpoint lacks roleId filter support yet
    }
  }, [id, role]);

  if (isLoading || !role) return <div className="p-10 text-center text-slate-500">Loading Role...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {role.name} {role.isSystem && <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded">SYSTEM ROLE</span>}
          </h1>
          <p className="text-slate-500">{role.description || "No description provided."}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Shield className="text-blue-500" /> Assigned Permissions
            </h2>
            
            {role.permissions?.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No permissions assigned.</p>
            ) : (
              <ul className="space-y-3">
                {role.permissions?.map(perm => (
                  <li key={perm._id} className="flex justify-between items-center p-3 bg-slate-50 border rounded-lg">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{perm.name}</p>
                      <p className="text-xs text-slate-500">{perm.description}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {perm.module}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Col: Users */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl shadow-sm p-6 h-full max-h-[600px] flex flex-col">
            <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Users className="text-green-500" /> Assigned Users ({role.userCount || 0})
            </h2>
            
            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <p className="text-sm text-slate-400">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No users are currently assigned this role.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {users.map(u => (
                    <li key={u._id} className="py-3 flex flex-col">
                      <span className="font-bold text-sm text-slate-800">{u.name}</span>
                      <span className="text-xs text-slate-500">{u.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoleDetails;
