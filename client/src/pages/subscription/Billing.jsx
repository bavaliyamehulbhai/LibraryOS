import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Billing = () => {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/subscriptions/current');
      if (res.data.success) {
        setSubscription(res.data.data.subscription);
        setUsage(res.data.data.usage);
      }
    } catch (error) {
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (used, max) => {
    if (max === -1) return 0;
    return Math.min(100, Math.round((used / max) * 100));
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  const plan = subscription?.planId || { planName: 'TRIAL', maxBooks: 100, maxMembers: 50 };
  const expiry = subscription?.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString() : 'N/A';
  
  const booksUsed = usage?.booksUsed || 0;
  const membersUsed = usage?.membersUsed || 0;
  const branchesUsed = usage?.branchesUsed || 1;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Usage</h1>
        <Link to="/plans" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
          Upgrade Plan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Current Plan Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4">Current Subscription</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Active Plan</span>
              <span className="font-bold text-lg text-blue-600">{plan.planName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {subscription?.status || 'ACTIVE'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Next Billing Date</span>
              <span className="font-medium">{expiry}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Auto Renew</span>
              <span className="font-medium">{subscription?.autoRenew ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>

        {/* Usage Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-6">Resource Usage</h2>
          
          <div className="space-y-6">
            
            {/* Books Usage */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Books</span>
                <span className="text-gray-500">
                  {booksUsed} / {plan.maxBooks === -1 ? 'Unlimited' : plan.maxBooks}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className={`h-2.5 rounded-full ${calculatePercentage(booksUsed, plan.maxBooks) > 80 ? 'bg-red-500' : 'bg-blue-600'}`} 
                  style={{ width: `${calculatePercentage(booksUsed, plan.maxBooks)}%` }}
                ></div>
              </div>
            </div>

            {/* Members Usage */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Members</span>
                <span className="text-gray-500">
                  {membersUsed} / {plan.maxMembers === -1 ? 'Unlimited' : plan.maxMembers}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className={`h-2.5 rounded-full ${calculatePercentage(membersUsed, plan.maxMembers) > 80 ? 'bg-red-500' : 'bg-green-500'}`} 
                  style={{ width: `${calculatePercentage(membersUsed, plan.maxMembers)}%` }}
                ></div>
              </div>
            </div>

            {/* Branches Usage */}
            {plan.maxBranches > 1 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Branches</span>
                  <span className="text-gray-500">
                    {branchesUsed} / {plan.maxBranches === -1 ? 'Unlimited' : plan.maxBranches}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-purple-500 h-2.5 rounded-full" 
                    style={{ width: `${calculatePercentage(branchesUsed, plan.maxBranches)}%` }}
                  ></div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Billing;
