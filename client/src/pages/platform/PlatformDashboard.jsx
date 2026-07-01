import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getPlatformMetrics, getPlatformTenants, suspendTenant, reactivateTenant } from "../../services/platformService";

const PlatformDashboard = () => {
  const [stats, setStats] = useState({
    totalLibraries: 0,
    totalUsers: 0,
    revenueARR: 0,
    activeSubscriptions: 0,
    totalApiToday: 0,
    totalStorageGB: 0
  });

  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tenantsRes] = await Promise.all([
        getPlatformMetrics(),
        getPlatformTenants()
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (tenantsRes.data.success) setTenants(tenantsRes.data.tenants);
    } catch (error) {
      toast.error("Failed to load platform data");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    try {
      const res = await suspendTenant(id);
      if (res.data.success) {
        toast.success("Tenant suspended successfully");
        setTenants(tenants.map(t => t._id === id ? { ...t, status: "SUSPENDED" } : t));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to suspend tenant");
    }
  };

  const handleReactivate = async (id) => {
    try {
      const res = await reactivateTenant(id);
      if (res.data.success) {
        toast.success("Tenant reactivated successfully");
        setTenants(tenants.map(t => t._id === id ? { ...t, status: "ACTIVE" } : t));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reactivate tenant");
    }
  };

  if (loading) return <div className="p-6">Loading Platform Dashboard...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Enterprise Operations Center</h1>
          <p className="text-gray-600">Platform-wide multi-tenant governance and monitoring.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Total Libraries</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalLibraries}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Active Subs</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">ARR</p>
          <p className="text-2xl font-bold text-gray-900">₹{stats.revenueARR}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">API Calls (Today)</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalApiToday}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Total Storage</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalStorageGB} GB</p>
        </div>
      </div>

      {/* Tenant Management */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Tenant Governance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.map(tenant => (
                <tr key={tenant._id} className={tenant.status === "SUSPENDED" ? "bg-red-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tenant.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      tenant.status === 'TRIAL' ? 'bg-blue-100 text-blue-800' : 
                      'bg-red-100 text-red-800'}`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className={`h-2 rounded-full ${tenant.healthScore > 90 ? 'bg-green-500' : tenant.healthScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${tenant.healthScore || 0}%` }}></div>
                      </div>
                      <span className="text-gray-600 font-medium">{tenant.healthScore || 0}/100</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">N/A</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {tenant.status === "SUSPENDED" ? (
                      <button onClick={() => handleReactivate(tenant._id)} className="text-green-600 hover:text-green-900 font-medium">Reactivate</button>
                    ) : (
                      <button onClick={() => handleSuspend(tenant._id)} className="text-red-600 hover:text-red-900 font-medium">Suspend</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
