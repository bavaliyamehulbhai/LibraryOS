import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useRazorpay from 'react-razorpay';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SubscriptionCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [Razorpay] = useRazorpay();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState(null);

  // We expect the selected Plan to be passed via React Router state
  const plan = location.state?.plan;

  useEffect(() => {
    if (!plan) {
      toast.error("No plan selected for checkout");
      navigate('/plans');
      return;
    }
  }, [plan]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await api.post('/coupons/apply', { couponCode, planId: plan._id });
      if (res.data.success) {
        setCouponStatus(res.data.data);
        toast.success(`Coupon applied! You saved Rs. ${res.data.data.discountAmount}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon");
      setCouponStatus(null);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. Ask backend to create Razorpay Subscription
      const res = await api.post('/razorpay/subscriptions/create', { 
        planId: plan._id,
        couponCode: couponStatus ? couponStatus.couponCode : null 
      });
      if (!res.data.success) throw new Error("Failed to create subscription");

      const { subscriptionId } = res.data.data;

      // 2. Open Razorpay Widget
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock', // Handled via env
        subscription_id: subscriptionId,
        name: 'LibraryOS SaaS',
        description: `Upgrade to ${plan.planName}`,
        handler: async (response) => {
          // 3. On success, verify payment via our backend
          try {
            const verifyRes = await api.post('/razorpay/subscriptions/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success("Payment successful! Your subscription is active.");
              navigate('/billing');
            }
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: '#3B82F6', // Tailwind blue-600
        },
      };

      const rzp = new Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        toast.error(`Payment Failed: ${response.error.description}`);
      });

      rzp.open();
      setLoading(false);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Error connecting to payment gateway');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold">Connecting to Secure Gateway...</h2>
            <p className="text-gray-500 mt-2">Please do not refresh the page.</p>
          </>
        ) : (
          <>
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold">Subscription Setup</h2>
            <p className="text-gray-500 mt-2">Click below to proceed with your payment.</p>
            
            {/* Promo Code Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h3 className="text-lg font-bold mb-4">Promo Code</h3>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. WELCOME20"
                  className="flex-1 border rounded-lg px-4 py-2 uppercase dark:bg-gray-800"
                  disabled={couponStatus?.applied}
                />
                <button 
                  onClick={handleApplyCoupon}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold"
                >
                  Apply
                </button>
              </div>
              {couponStatus && (
                <p className="text-green-600 text-sm mt-2 font-medium">
                  Discount applied: -Rs. {couponStatus.discountAmount}
                </p>
              )}
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={loading}
              className="w-full py-4 mt-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center transition-all disabled:opacity-50"
            >
              Pay Now
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
