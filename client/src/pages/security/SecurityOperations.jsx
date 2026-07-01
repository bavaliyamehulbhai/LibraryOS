import { useState, useEffect } from "react";
import securityService from "../../services/securityService";
import { getAccessReviews } from "../../services/governanceService";
import { toast } from "react-hot-toast";

const SecurityOperations = () => {
  const [incidents, setIncidents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsRes, reviewsRes] = await Promise.all([
          securityService.getSecurityAlerts(),
          getAccessReviews()
        ]);
        
        // Ensure we handle the standard API response structure { success: true, data: [] }
        setIncidents(alertsRes.data || []);
        setReviews(reviewsRes.data || []);
      } catch (error) {
        toast.error("Failed to fetch security operations data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading security data...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Security Operations</h1>
          <p className="text-gray-600">Identity Governance, Access Reviews, and Incident Management.</p>
        </div>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold border border-green-200">
          Org Security Score: 92/100
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Incidents */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            Active Security Incidents
          </h2>
          <div className="space-y-4">
            {incidents.map(inc => (
              <div key={inc._id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">{inc.title}</h3>
                  <p className="text-sm text-gray-500">{inc.description || inc.type}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${inc.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                    {inc.severity}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{inc.isResolved ? 'RESOLVED' : 'OPEN'}</p>
                </div>
              </div>
            ))}
            {incidents.length === 0 && <p className="text-sm text-gray-500">No active incidents.</p>}
          </div>
        </div>

        {/* Access Reviews */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Pending Access Reviews</h2>
            <button className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 font-medium">
              Initiate Quarterly Review
            </button>
          </div>
          <div className="space-y-4">
            {reviews.map(rev => (
              <div key={rev._id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">{rev.userId?.email || "Unknown User"}</h3>
                  <p className="text-sm text-gray-500">Current Role: <span className="font-mono bg-gray-100 px-1 rounded">{rev.userId?.role || "N/A"}</span></p>
                </div>
                <div className="space-x-2">
                  <button className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium">Approve</button>
                  <button className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium">Revoke</button>
                </div>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-gray-500">No pending access reviews.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityOperations;
