import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Subscriptions = () => {
  const [currentPlan, setCurrentPlan] = useState('Professional');
  const [isProcessing, setIsProcessing] = useState(false);
  const [plans, setPlans] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  
  const fetchData = async () => {
    try {
      const [plansRes, dashRes] = await Promise.all([
        api.get('/v1/subscriptions/plans'),
        api.get('/v1/subscriptions/current')
      ]);
      if (plansRes.data.success) {
        setPlans(plansRes.data.data);
      }
      if (dashRes.data.success) {
        setDashboard(dashRes.data.data);
        const activePlan = dashRes.data.data?.subscription?.planId;
        setCurrentPlan(activePlan?.planName || activePlan?.name || 'Free Tier');
      }
    } catch (error) {
      console.error("Failed to load subscription data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManageBilling = () => {
    setIsProcessing(true);
    toast.loading('Redirecting to secure billing portal...', { id: 'billing' });
    setTimeout(() => {
      toast.success('Billing portal accessed successfully!', { id: 'billing' });
      setIsProcessing(false);
    }, 1500);
  };

  const confirmCancellation = async () => {
    setIsCancelModalOpen(false);
    setIsProcessing(true);
    toast.loading('Processing cancellation...', { id: 'cancel' });
    try {
      await api.post('/v1/subscriptions/downgrade');
      await fetchData();
      toast.success('Your subscription has been cancelled.', { id: 'cancel' });
    } catch (error) {
      toast.error('Failed to cancel subscription', { id: 'cancel' });
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpgrade = async (planId, planName) => {
    setIsProcessing(true);
    toast.loading(`Initializing payment for ${planName}...`, { id: 'upgrade' });
    try {
      // 1. Create subscription on backend
      const res = await api.post('/v1/razorpay/subscriptions/create', { 
        planId,
        libraryId: dashboard?.subscription?.libraryId 
      });
      
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to initialize subscription');
      }
      
      const checkoutData = res.data.data;

      // Handle mock bypass
      if (checkoutData.mockBypass) {
        await fetchData();
        toast.success(`Successfully upgraded to ${checkoutData.planName}!`, { id: 'upgrade' });
        setIsProcessing(false);
        return;
      }
      
      // 2. Open Razorpay checkout
      const options = {
        key: checkoutData.key,
        subscription_id: checkoutData.subscriptionId,
        name: "LibraryOS",
        description: `Upgrade to ${planName} Plan`,
        handler: async function (response) {
          try {
            toast.loading('Verifying payment...', { id: 'upgrade' });
            // 3. Verify payment on backend
            const verifyRes = await api.post('/v1/razorpay/subscriptions/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              planId,
              libraryId: dashboard?.subscription?.libraryId
            });
            
            if (verifyRes.data.success) {
              setCurrentPlan(planName);
              toast.success(`Successfully upgraded to ${planName}!`, { id: 'upgrade' });
            } else {
              toast.error('Payment verification failed', { id: 'upgrade' });
            }
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed', { id: 'upgrade' });
          } finally {
            setIsProcessing(false);
          }
        },
        theme: {
          color: "#2563EB"
        }
      };
      
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed or cancelled', { id: 'upgrade' });
        setIsProcessing(false);
      });
      
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initialize subscription', { id: 'upgrade' });
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription & Billing</h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Manage your subscription plan, billing history, and payment methods.</p>
        </div>

        {/* Current Plan Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Current Plan: <span className="text-blue-600 dark:text-blue-400">{currentPlan}</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{
                __html: currentPlan === 'Free Tier' 
                  ? 'Your account is currently restricted. Please upgrade to restore features.'
                  : 'Your subscription will auto-renew on <strong>July 25, 2026</strong>.'
              }}></p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button 
                onClick={() => setIsCancelModalOpen(true)}
                disabled={isProcessing || currentPlan === 'Free Tier'}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition disabled:opacity-50"
              >
                Cancel Plan
              </button>
              <button 
                onClick={() => toast.error('Billing portal setup is incomplete. Please contact support.', { id: 'billing' })}
                disabled={isProcessing || currentPlan === 'Free Tier'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                Manage Billing
              </button>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Book Capacity</span>
                <span className="text-gray-500">{dashboard?.usage?.booksUsed || 0} / {dashboard?.subscription?.planId?.maxBooks === -1 ? 'Unlimited' : (dashboard?.subscription?.planId?.maxBooks || 50)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className={`h-2 rounded-full bg-blue-600`} style={{ width: dashboard?.subscription?.planId?.maxBooks === -1 ? '100%' : `${Math.min(100, ((dashboard?.usage?.booksUsed || 0) / (dashboard?.subscription?.planId?.maxBooks || 50)) * 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Active Branches</span>
                <span className="text-gray-500">{dashboard?.usage?.branchesUsed || 0} / {dashboard?.subscription?.planId?.maxBranches === -1 ? 'Unlimited' : (dashboard?.subscription?.planId?.maxBranches || 1)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className={`h-2 rounded-full bg-green-500`} style={{ width: dashboard?.subscription?.planId?.maxBranches === -1 ? '100%' : `${Math.min(100, ((dashboard?.usage?.branchesUsed || 0) / (dashboard?.subscription?.planId?.maxBranches || 1)) * 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Member Capacity</span>
                <span className="text-gray-500">{dashboard?.usage?.membersUsed || 0} / {dashboard?.subscription?.planId?.maxMembers === -1 ? 'Unlimited' : (dashboard?.subscription?.planId?.maxMembers || 100)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: dashboard?.subscription?.planId?.maxMembers === -1 ? '100%' : `${Math.min(100, ((dashboard?.usage?.membersUsed || 0) / (dashboard?.subscription?.planId?.maxMembers || 100)) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Tiers */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Upgrade your plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => {
            const isCurrentPlan = currentPlan === (plan.planName || plan.name);
            
            return (
              <div 
                key={plan._id || idx} 
                className={`bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 transition-transform hover:-translate-y-1 ${
                  isCurrentPlan 
                    ? 'border-blue-500 shadow-xl relative' 
                    : 'border-gray-100 dark:border-gray-700 shadow-sm'
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Current Plan
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.planName || plan.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 h-10">{plan.description}</p>
                
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹{plan.price || plan.monthlyPrice || 0}</span>
                  <span className="text-gray-500 dark:text-gray-400 font-medium">/month</span>
                </div>

                <button 
                  onClick={() => !isCurrentPlan && handleUpgrade(plan._id, plan.planName || plan.name)}
                  disabled={isCurrentPlan || isProcessing}
                  className={`w-full py-3 px-4 rounded-lg font-bold mb-8 transition ${
                    isCurrentPlan
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 cursor-default'
                      : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 disabled:opacity-50'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Upgrade to ' + (plan.planName || plan.name)}
                </button>

                <div className="space-y-4">
                  {plan.features?.map((feature, i) => (
                    <div key={i} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                  {(!plan.features || plan.features.length === 0) && (
                    <div className="text-sm text-gray-500 italic">No features listed</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cancel Subscription?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to cancel your <strong>{currentPlan}</strong> plan? You will lose access to premium features immediately. This action cannot be undone.
              </p>
              
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={confirmCancellation}
                  className="w-full px-5 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Yes, cancel my plan
                </button>
                <button 
                  onClick={() => setIsCancelModalOpen(false)}
                  className="w-full px-5 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                >
                  No, keep my plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
