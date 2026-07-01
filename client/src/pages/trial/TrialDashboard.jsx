import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Users, BookOpen, Clock, CheckCircle } from 'lucide-react';
import StatCard from '../../components/common/StatCard';

const TrialDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/trial/analytics');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load trial analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async (trialId, libraryId) => {
    try {
      const res = await api.put('/trial/extend', {
        libraryId,
        daysAdded: 7,
        reason: "Admin Granted Extension"
      });
      if (res.data.success) {
        toast.success("Trial extended by 7 days");
        fetchAnalytics(); // refresh
      }
    } catch (error) {
      toast.error("Failed to extend trial");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Lead Scoring Engine...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trial Management (SaaS Conversion)</h1>
        <p className="text-gray-500">Track trials, identify hot leads, and optimize conversion rates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Trials" value={data?.totalTrials || 0} icon={Users} color="blue" />
        <StatCard title="Active Trials" value={data?.activeTrials || 0} icon={Clock} color="yellow" />
        <StatCard title="Converted" value={data?.convertedTrials || 0} icon={CheckCircle} color="green" />
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">{data?.conversionRate || 0}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">🔥 Hot Leads (High Conversion Probability)</h2>
          <p className="text-sm text-gray-500 mt-1">Based on engagement score (Books, Members, Logins)</p>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Library</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial Ends</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {data?.hotLeads?.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No active trials to score.</td></tr>
            ) : (
              data?.hotLeads?.map((lead) => (
                <tr key={lead._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{lead.libraryId?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{lead.libraryId?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${lead.leadScore >= 70 ? 'bg-red-100 text-red-800' : 
                          lead.leadScore >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {lead.leadScore}/100
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(lead.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleExtend(lead._id, lead.libraryId._id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-bold"
                    >
                      + Extend Trial
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrialDashboard;
