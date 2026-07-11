import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Subscriptions = () => {
  const [currentPlan, setCurrentPlan] = useState('Professional');
  const [isProcessing, setIsProcessing] = useState(false);
  const [plans, setPlans] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const navigate = useNavigate();
  
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
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock',
        order_id: checkoutData.subscriptionId, // We are now passing the order.id from backend here
        name: "LibraryOS",
        description: `Upgrade to ${planName} Plan`,
        handler: async function (response) {
          try {
            toast.loading('Verifying payment...', { id: 'upgrade' });
            // 3. Verify payment on backend
            const verifyRes = await api.post('/v1/razorpay/subscriptions/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
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
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Subscription & Billing</h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400 font-medium">Manage your subscription plan, billing history, and payment methods.</p>
        </div>

        {/* Current Plan Overview */}
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 p-8 relative z-10">
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
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 rounded-xl transition-all font-bold text-sm shadow-sm hover:shadow-md disabled:opacity-50"
              >
                Cancel Plan
              </button>
              <button 
                onClick={() => navigate('/invoices')}
                disabled={isProcessing || currentPlan === 'Free Tier'}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
              >
                Manage Billing
              </button>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[11px]">Book Capacity</span>
                <span className="text-gray-500 font-bold">{dashboard?.usage?.booksUsed || 0} / {dashboard?.subscription?.planId?.maxBooks === -1 ? 'Unlimited' : (dashboard?.subscription?.planId?.maxBooks || 50)}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-3 shadow-inner overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className={`h-full bg-gradient-to-r from-blue-500 to-cyan-400`} style={{ width: dashboard?.subscription?.planId?.maxBooks === -1 ? '100%' : `${Math.min(100, ((dashboard?.usage?.booksUsed || 0) / (dashboard?.subscription?.planId?.maxBooks || 50)) * 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[11px]">Active Branches</span>
                <span className="text-gray-500 font-bold">{dashboard?.usage?.branchesUsed || 0} / {dashboard?.subscription?.planId?.maxBranches === -1 ? 'Unlimited' : (dashboard?.subscription?.planId?.maxBranches || 1)}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-3 shadow-inner overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className={`h-full bg-gradient-to-r from-emerald-500 to-green-400`} style={{ width: dashboard?.subscription?.planId?.maxBranches === -1 ? '100%' : `${Math.min(100, ((dashboard?.usage?.branchesUsed || 0) / (dashboard?.subscription?.planId?.maxBranches || 1)) * 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[11px]">Member Capacity</span>
                <span className="text-gray-500 font-bold">{dashboard?.usage?.membersUsed || 0} / {dashboard?.subscription?.planId?.maxMembers === -1 ? 'Unlimited' : (dashboard?.subscription?.planId?.maxMembers || 100)}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-3 shadow-inner overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: dashboard?.subscription?.planId?.maxMembers === -1 ? '100%' : `${Math.min(100, ((dashboard?.usage?.membersUsed || 0) / (dashboard?.subscription?.planId?.maxMembers || 100)) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Tiers */}
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Upgrade your plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {plans.map((plan, idx) => {
            const isCurrentPlan = currentPlan === (plan.planName || plan.name);
            const planFeatures = plan.features?.length > 0 ? plan.features : [
              `${plan.maxBooks === -1 ? 'Unlimited' : plan.maxBooks.toLocaleString()} Books Capacity`,
              `${plan.maxMembers === -1 ? 'Unlimited' : plan.maxMembers.toLocaleString()} Members Capacity`,
              `${plan.maxBranches === -1 ? 'Unlimited' : plan.maxBranches} Active Branches`,
              `${plan.maxStorageMB >= 1024 ? (plan.maxStorageMB/1024).toFixed(1) + 'GB' : plan.maxStorageMB + 'MB'} Storage`,
              plan.price > 0 ? 'Priority Support' : 'Community Support'
            ];
            
            return (
              <div 
                key={plan._id || idx} 
                className={`bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl p-8 border border-white/50 dark:border-gray-700/50 transition-all duration-300 ${
                  isCurrentPlan 
                    ? 'ring-4 ring-blue-500/50 shadow-2xl shadow-blue-900/20 transform scale-105 z-20 relative' 
                    : 'shadow-lg hover:-translate-y-2 hover:shadow-2xl'
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                      Current Plan
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{plan.planName || plan.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 h-10 font-medium">{plan.description}</p>
                
                <div className="my-8 flex items-baseline">
                  <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">₹{plan.price || plan.monthlyPrice || 0}</span>
                  <span className="text-gray-500 dark:text-gray-400 font-bold ml-1">/month</span>
                </div>

                <button 
                  onClick={() => !isCurrentPlan && handleUpgrade(plan._id, plan.planName || plan.name)}
                  disabled={isCurrentPlan || isProcessing}
                  className={`w-full py-3.5 px-4 rounded-xl font-black mb-8 transition-all shadow-md ${
                    isCurrentPlan
                      ? 'bg-blue-50/50 text-blue-700 border-2 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 cursor-default shadow-none'
                      : 'bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-black hover:to-gray-900 dark:from-white dark:to-gray-200 dark:text-gray-900 dark:hover:from-gray-100 dark:hover:to-white hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 border border-transparent'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Upgrade to ' + (plan.planName || plan.name)}
                </button>

                <div className="space-y-4">
                  {planFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                        <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity p-4">
          <div className="bg-white/90 backdrop-blur-2xl dark:bg-gray-800/90 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-white/50 dark:border-gray-700/50">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6 shadow-inner">
                <svg className="h-10 w-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Cancel Subscription?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">
                Are you sure you want to cancel your <strong className="text-gray-800 dark:text-gray-200">{currentPlan}</strong> plan? You will lose access to premium features immediately. This action cannot be undone.
              </p>
              
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={confirmCancellation}
                  className="w-full px-6 py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Yes, cancel my plan
                </button>
                <button 
                  onClick={() => setIsCancelModalOpen(false)}
                  className="w-full px-6 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
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
