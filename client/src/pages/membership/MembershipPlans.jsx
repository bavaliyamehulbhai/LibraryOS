import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { confirmAlert } from '../../utils/confirmAlert';

const MembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/membership-plans');
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (await confirmAlert('Are you sure you want to delete this membership plan?')) {
      try {
        await api.delete(`/v1/membership-plans/${id}`);
        toast.success('Plan deleted successfully');
        fetchPlans();
        fetchAnalytics();
      } catch (error) {
        toast.error('Failed to delete membership plan');
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/v1/membership-plans/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchAnalytics();
  }, []);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Membership Plans</h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Configure borrowing rules, fine rates, and limits.</p>
          </div>
          <Link to="/membership-plans/new" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center font-bold">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Create New Plan
          </Link>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 flex flex-col hover:-translate-y-1 transition-transform">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Total Plans Configured</span>
              <span className="text-4xl font-black text-gray-900 dark:text-white mt-1">{analytics.totalPlans}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 flex flex-col hover:-translate-y-1 transition-transform">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Active Plans</span>
              <span className="text-4xl font-black text-green-600 dark:text-green-400 mt-1">{analytics.activePlans}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 flex flex-col items-center justify-center hover:-translate-y-1 transition-transform">
              <div className="text-center text-gray-600 dark:text-gray-300 font-medium">Use plans to strictly enforce limits across different member types.</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Plans Configured</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first membership plan to start issuing books.</p>
            <Link to="/membership-plans/new" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm inline-block">
              Create Plan
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
            {plans.map(plan => (
              <div key={plan._id} className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col relative z-10">
                <div className={`h-2 ${plan.status === 'ACTIVE' ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{plan.name}</h3>
                      <span className="inline-block mt-1.5 px-2.5 py-1 bg-gray-100/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-sm border border-gray-200/50 dark:border-gray-600/50">
                        {plan.planType}
                      </span>
                    </div>
                    {plan.status === 'ACTIVE' ? (
                      <span className="text-green-700 bg-green-100 border border-green-200 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">Active</span>
                    ) : (
                      <span className="text-gray-600 bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">Inactive</span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-1">{plan.description || "No description provided."}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mb-6 bg-gradient-to-br from-gray-50/50 to-transparent dark:from-gray-900/50 border border-white/60 dark:border-gray-700/50 p-4 rounded-2xl">
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Borrow Limit</div>
                      <div className="font-black text-gray-900 dark:text-white">{plan.borrowLimit} Books</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Issue Duration</div>
                      <div className="font-black text-gray-900 dark:text-white">{plan.issueDuration} Days</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Renewals</div>
                      <div className="font-black text-gray-900 dark:text-white">{plan.renewalLimit} Max</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Fine Rate</div>
                      <div className="font-black text-red-600">₹{plan.finePerDay} / Day</div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-100/50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-800/30 flex justify-between items-center backdrop-blur-md">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Reservations: {plan.reservationLimit}</span>
                  <div className="space-x-3">
                    <Link to={`/membership-plans/${plan._id}/edit`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-bold transition">Edit</Link>
                    <button onClick={() => handleDelete(plan._id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-bold transition">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipPlans;
