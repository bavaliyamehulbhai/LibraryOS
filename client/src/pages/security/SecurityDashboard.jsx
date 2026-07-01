import { useState, useEffect } from "react";
import securityService from "../../services/securityService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

const SecurityDashboard = () => {
  const [metrics, setMetrics] = useState({ totalLogins: 0, failedLogins: 0, lockedUsers: 0, activeSessions: 0 });
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        const [metricsRes, alertsRes, activityRes, trendsRes] = await Promise.all([
          securityService.getSecurityMetrics(),
          securityService.getSecurityAlerts(),
          securityService.getLoginActivity(),
          securityService.getLoginTrends()
        ]);
        
        setMetrics(metricsRes.data);
        setAlerts(alertsRes.data);
        setActivity(activityRes.data);
        setTrends(trendsRes.data);
      } catch (error) {
        toast.error("Failed to fetch security data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSecurityData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading security dashboard...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Security Dashboard</h1>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Logins</h3>
          <p className="text-3xl font-bold mt-2">{metrics.totalLogins}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Failed Logins</h3>
          <p className="text-3xl font-bold mt-2">{metrics.failedLogins}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Locked Accounts</h3>
          <p className="text-3xl font-bold mt-2">{metrics.lockedUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Active Sessions</h3>
          <p className="text-3xl font-bold mt-2">{metrics.activeSessions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Trend Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Login Trends (30 Days)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Login Activity</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activity.map((act) => (
                    <tr key={act._id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{act.email || act.userId?.email || 'Unknown'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{act.ipAddress}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{act.os} / {act.browser}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          act.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                          act.status === 'LOCKED' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {act.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(act.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {activity.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-center text-gray-500">No recent activity</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Security Alerts */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex justify-between items-center">
              <span>Security Alerts</span>
              {alerts.length > 0 && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">{alerts.length} New</span>}
            </h3>
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert._id} className="border-l-4 border-red-500 pl-4 py-2">
                  <p className="text-sm font-semibold text-gray-800">{alert.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(alert.createdAt).toLocaleString()}</p>
                </div>
              ))}
              {alerts.length === 0 && (
                <p className="text-sm text-gray-500 italic">No security alerts detected.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
