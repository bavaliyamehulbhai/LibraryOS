import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const navigate = useNavigate();

  // Mocking the plans since there's no seeder yet
  const fallbackPlans = [
    {
      _id: '1',
      planCode: 'PLAN-STARTER',
      planName: 'Starter Plan',
      price: 999,
      maxBooks: 5000,
      maxMembers: 500,
      description: 'Perfect for small school libraries.'
    },
    {
      _id: '2',
      planCode: 'PLAN-PRO',
      planName: 'Professional Plan',
      price: 2999,
      maxBooks: 50000,
      maxMembers: 5000,
      description: 'For growing libraries needing advanced analytics and SMS.'
    },
    {
      _id: '3',
      planCode: 'PLAN-ENTERPRISE',
      planName: 'Enterprise Plan',
      price: 9999,
      maxBooks: -1, // Unlimited
      maxMembers: -1,
      description: 'Unlimited limits with White Label and Custom Domain support.'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Parallel requests
      const [plansRes, currentRes] = await Promise.all([
        api.get('/subscriptions/plans').catch(() => ({ data: { success: false } })),
        api.get('/subscriptions/current').catch(() => ({ data: { success: false } }))
      ]);

      if (plansRes.data?.success && plansRes.data.data.length > 0) {
        setPlans(plansRes.data.data);
      } else {
        setPlans(fallbackPlans);
      }

      if (currentRes.data?.success) {
        setCurrentSubscription(currentRes.data.data.subscription);
      }
    } catch (error) {
      toast.error('Failed to load pricing data');
      setPlans(fallbackPlans);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (plan) => {
    navigate('/checkout', { state: { plan } });
  };

  if (loading) return <div className="p-8 text-center">Loading plans...</div>;

  const currentPlanCode = currentSubscription?.planId?.planCode || 'TRIAL';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Upgrade Your Library</h1>
        <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">Choose the perfect plan for your institution's needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {plans.map((plan) => (
          <div key={plan._id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 ${currentPlanCode === plan.planCode ? 'border-blue-500' : 'border-transparent'}`}>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.planName}</h3>
              <p className="mt-4 text-gray-500 dark:text-gray-400 h-12">{plan.description}</p>
              
              <div className="mt-8 flex items-baseline text-5xl font-extrabold">
                ₹{plan.price}
                <span className="ml-1 text-xl font-medium text-gray-500 dark:text-gray-400">/mo</span>
              </div>

              <ul className="mt-8 space-y-4">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  {plan.maxBooks === -1 ? 'Unlimited' : plan.maxBooks.toLocaleString()} Books
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  {plan.maxMembers === -1 ? 'Unlimited' : plan.maxMembers.toLocaleString()} Members
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Advanced Reports
                </li>
                {plan.planCode !== 'PLAN-STARTER' && (
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    WhatsApp & SMS Alerts
                  </li>
                )}
                {plan.planCode === 'PLAN-ENTERPRISE' && (
                  <li className="flex items-center text-blue-600 font-medium">
                    <span className="text-green-500 mr-3">✓</span>
                    White Label & Custom Domain
                  </li>
                )}
              </ul>

              <div className="mt-8">
                {currentPlanCode === plan.planCode ? (
                  <button disabled className="w-full bg-gray-100 text-gray-500 dark:bg-gray-700 py-3 rounded-xl font-bold">
                    Current Plan
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpgrade(plan)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-md"
                  >
                    Upgrade Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;
