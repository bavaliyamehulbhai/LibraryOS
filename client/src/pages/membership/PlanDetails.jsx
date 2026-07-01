import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PlanDetails = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/v1/membership-plans/${id}`);
        if (res.data.success) {
          setPlan(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load plan details');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!plan) {
    return <div className="p-8 text-center text-gray-500">Plan not found</div>;
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link to="/membership-plans" className="text-sm text-blue-600 hover:underline mb-2 inline-block">← Back to Plans</Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              {plan.name}
              {plan.status === 'ACTIVE' ? (
                <span className="ml-4 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded font-bold uppercase tracking-wider">Active</span>
              ) : (
                <span className="ml-4 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded font-bold uppercase tracking-wider">Inactive</span>
              )}
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">{plan.description || "No description available"}</p>
          </div>
          <div className="flex space-x-4">
            <Link to={`/membership-plans/${plan._id}/edit`} className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium shadow-sm">
              Edit Plan
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{plan.memberCount || 0}</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Members</span>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Plan Policy Limits</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="text-2xl mr-4">📚</div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Borrow Limit</div>
                  <div className="font-bold text-gray-900 dark:text-white">{plan.borrowLimit} Books</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="text-2xl mr-4">⏱️</div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Issue Duration</div>
                  <div className="font-bold text-gray-900 dark:text-white">{plan.issueDuration} Days</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="text-2xl mr-4">🔄</div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Max Renewals</div>
                  <div className="font-bold text-gray-900 dark:text-white">{plan.renewalLimit} Times</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="text-2xl mr-4">🔖</div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Max Reservations</div>
                  <div className="font-bold text-gray-900 dark:text-white">{plan.reservationLimit} Books</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-1">Financial Rules</h3>
            <p className="text-red-600 dark:text-red-500 text-sm">Fine configuration for overdue returns.</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-red-700 dark:text-red-400">₹{plan.finePerDay}</span>
            <span className="text-red-600 dark:text-red-500 ml-1">/ Day Late</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlanDetails;
