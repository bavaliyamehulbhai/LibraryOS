import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

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
    if (window.confirm('Are you sure you want to delete this membership plan?')) {
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
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Membership Plans</h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Configure borrowing rules, fine rates, and limits.</p>
          </div>
          <Link to="/membership-plans/new" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center font-medium shadow-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Create New Plan
          </Link>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Plans Configured</span>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalPlans}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Plans</span>
              <span className="text-3xl font-bold text-green-600">{analytics.activePlans}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm">Use plans to strictly enforce limits across different member types.</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition overflow-hidden flex flex-col">
                <div className={`h-2 ${plan.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-medium tracking-wide uppercase">
                        {plan.planType}
                      </span>
                    </div>
                    {plan.status === 'ACTIVE' ? (
                      <span className="text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Active</span>
                    ) : (
                      <span className="text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Inactive</span>
                    )}
                  </div>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 h-10 line-clamp-2">{plan.description || "No description provided."}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Borrow Limit</div>
                      <div className="font-bold text-gray-900 dark:text-white">{plan.borrowLimit} Books</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Issue Duration</div>
                      <div className="font-bold text-gray-900 dark:text-white">{plan.issueDuration} Days</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Renewals</div>
                      <div className="font-bold text-gray-900 dark:text-white">{plan.renewalLimit} Max</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Fine Rate</div>
                      <div className="font-bold text-red-600">₹{plan.finePerDay} / Day</div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Reservations: {plan.reservationLimit}</span>
                  <div className="space-x-3">
                    <Link to={`/membership-plans/${plan._id}/edit`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition">Edit</Link>
                    <Link to={`/membership-plans/${plan._id}`} className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-sm font-bold transition">View Details</Link>
                    <button onClick={() => handleDelete(plan._id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition">Delete</button>
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
