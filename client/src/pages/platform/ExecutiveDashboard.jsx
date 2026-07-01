import { useState, useEffect } from "react";
import { getExecutiveSummary, getInsights } from "../../services/analyticsService";
import { toast } from "react-hot-toast";

const ExecutiveDashboard = () => {
  const [summary, setSummary] = useState({
    mrr: 0,
    predictedMrr: 0,
    dau: 0,
    wau: 0,
    mau: 0,
    growthRate: "0%",
    churnRiskCount: 0
  });

  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, insRes] = await Promise.all([
          getExecutiveSummary(),
          getInsights()
        ]);
        if (sumRes.data.success) setSummary(sumRes.data.summary);
        if (insRes.data.success) setInsights(insRes.data.insights);
      } catch (error) {
        toast.error("Failed to load executive insights.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading Executive Dashboard...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Executive KPI Dashboard</h1>
          <p className="text-gray-600">AI-driven platform intelligence and forecasting.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow text-sm font-medium">
          Generate Full Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow text-white">
          <p className="text-sm font-medium opacity-90">Current MRR</p>
          <p className="text-3xl font-bold mt-1">₹{summary.mrr.toLocaleString()}</p>
          <p className="text-xs mt-2 bg-green-700 inline-block px-2 py-1 rounded bg-opacity-50">Predicted Next Mo: ₹{summary.predictedMrr.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Growth Rate (MoM)</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{summary.growthRate}</p>
          <p className="text-xs text-green-600 mt-2 font-medium">↑ Faster than last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Active Users (DAU / MAU)</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{summary.dau.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">MAU: {summary.mau.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Libraries at Risk</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{summary.churnRiskCount}</p>
          <p className="text-xs text-gray-400 mt-2">Requires immediate outreach</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* AI Recommendations */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="text-indigo-600 mr-2">✦</span> AI Insights & Recommendations
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {insights.map(insight => (
              <div key={insight.id} className="p-5 hover:bg-gray-50 transition">
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <div className={`mt-1 w-2 h-2 rounded-full mr-3 ${insight.priority === 'HIGH' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{insight.date}</span>
                </div>
                <div className="mt-3 ml-5">
                  <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded px-3 py-1">
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Activity */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Autonomous Operations</h2>
          <div className="space-y-4">
            <div className="flex items-center text-sm">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">✓</div>
              <div>
                <p className="font-medium text-gray-800">Nightly Aggregation Complete</p>
                <p className="text-xs text-gray-500">Today at 00:01 AM</p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">✓</div>
              <div>
                <p className="font-medium text-gray-800">Weekly Executive Report</p>
                <p className="text-xs text-gray-500">Sent to admin@libraryos.com</p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">⟳</div>
              <div>
                <p className="font-medium text-gray-800">Anomaly Detection Engine</p>
                <p className="text-xs text-gray-500">Running in background</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
