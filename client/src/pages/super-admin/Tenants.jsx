import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { confirmAlert } from '../../utils/confirmAlert';
import toast from 'react-hot-toast';
import { Building2, Ban, CheckCircle } from 'lucide-react';

const TenantsDashboard = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await api.get('/super-admin/tenants');
      if (res.data.success) {
        setTenants(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!(await confirmAlert(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this tenant?`))) return;
    
    try {
      const res = await api.put(`/super-admin/tenants/${id}/toggle`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchTenants();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Tenants...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tenant Management</h1>
        <p className="text-gray-500 mt-1">View and manage all registered libraries across the platform.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Library (Tenant)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {tenants.map((tenant) => (
              <tr key={tenant._id} className={!tenant.isActive ? 'opacity-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{tenant.name}</div>
                      <div className="text-sm text-gray-500">{tenant.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {tenant.subscription ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {tenant.subscription.planName}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">None</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {tenant.isActive ? (
                    <span className="flex items-center text-sm font-medium text-green-600"><CheckCircle className="w-4 h-4 mr-1"/> Active</span>
                  ) : (
                    <span className="flex items-center text-sm font-medium text-red-600"><Ban className="w-4 h-4 mr-1"/> Suspended</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleToggleStatus(tenant._id, tenant.isActive)}
                    className={`${tenant.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} font-bold`}
                  >
                    {tenant.isActive ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TenantsDashboard;
