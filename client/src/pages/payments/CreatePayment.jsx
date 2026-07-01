import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = ["CASH", "UPI", "CARD", "RAZORPAY", "BANK_TRANSFER"];

const CreatePayment = () => {
  const navigate = useNavigate();
  const [memberCode, setMemberCode] = useState('');
  const [member, setMember] = useState(null);
  const [pendingFines, setPendingFines] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [selectedFine, setSelectedFine] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleMemberSearch = async (e) => {
    e.preventDefault();
    if (!memberCode) return;
    setSearchLoading(true);
    try {
      const res = await api.get(`/v1/members?search=${memberCode}`);
      const exact = res.data?.data?.find(m => m.memberCode === memberCode || m.memberCardNumber === memberCode);
      if (exact) {
        setMember(exact);
        const finesRes = await api.get(`/v1/fines?memberId=${exact._id}`);
        const active = finesRes.data.data.filter(f => f.status === 'PENDING' || f.status === 'PARTIAL');
        setPendingFines(active);
        setSelectedFine(null);
        toast.success(`Member found: ${exact.firstName} ${exact.lastName}`);
      } else {
        toast.error("Member not found");
        setMember(null);
        setPendingFines([]);
      }
    } catch (err) {
      toast.error("Failed to load member");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFineSelect = (fine) => {
    setSelectedFine(fine);
    setAmount(String(fine.pendingAmount));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFine || !amount || !paymentMethod) return toast.error("Please fill all fields");
    setSubmitting(true);
    try {
      if (paymentMethod === 'RAZORPAY') {
        const orderRes = await api.post('/v1/razorpay/fines/create-order', {
          amount: Number(amount),
          fineId: selectedFine._id
        });

        if (orderRes.data.success) {
          const { id, amount: orderAmount, currency } = orderRes.data.data;
          const key = orderRes.data.key;

          if (key === "mock_key") {
            toast.success("MOCK MODE: Simulating successful payment...");
            // Simulate immediate success verification
            const verifyRes = await api.post('/v1/razorpay/fines/verify', {
              razorpay_payment_id: "pay_mock_" + Date.now(),
              razorpay_order_id: id,
              razorpay_signature: "mock_signature",
              memberId: member._id,
              fineId: selectedFine._id,
              amount: Number(amount)
            });

            if (verifyRes.data.success) {
              toast.success(`✅ Mock Payment of ₹${amount} recorded!`);
              navigate(`/payments/${verifyRes.data.data._id}`);
            } else {
              toast.error("Mock verification failed");
            }
            setSubmitting(false);
            return;
          }

          const options = {
            key,
            amount: orderAmount,
            currency,
            name: "LibraryOS",
            description: `Fine Payment - ${selectedFine.fineCode}`,
            order_id: id,
            handler: async function (response) {
              try {
                const verifyRes = await api.post('/v1/razorpay/fines/verify', {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  memberId: member._id,
                  fineId: selectedFine._id,
                  amount: Number(amount)
                });

                if (verifyRes.data.success) {
                  toast.success(`✅ Payment of ₹${amount} recorded!`);
                  navigate(`/payments/${verifyRes.data.data._id}`);
                } else {
                  toast.error("Payment verification failed");
                }
              } catch (verifyErr) {
                toast.error(verifyErr.response?.data?.message || 'Payment verification failed');
              } finally {
                setSubmitting(false);
              }
            },
            prefill: {
              name: `${member.firstName} ${member.lastName}`,
              email: member.email || "",
              contact: member.phone || ""
            },
            theme: { color: "#2563eb" },
            modal: {
              ondismiss: function() {
                setSubmitting(false);
                toast.error("Payment cancelled");
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          return; // Stop the manual submission flow
        }
      }

      // Default manual payment flow
      const res = await api.post('/v1/payments', {
        memberId: member._id,
        fineId: selectedFine._id,
        amount: Number(amount),
        paymentMethod,
        transactionId: transactionRef || undefined
      });
      if (res.data.success) {
        toast.success(`✅ Payment of ₹${amount} recorded!`);
        navigate(`/payments/${res.data.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">💵</span> Collect Fine Payment
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Search a member, select their fine, and record the payment.</p>
        </div>

        {/* Member Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Step 1: Find Member</h2>
          <form onSubmit={handleMemberSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Scan or enter Member ID..."
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
            <button type="submit" disabled={searchLoading} className="px-8 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-bold disabled:opacity-50">
              {searchLoading ? 'Searching...' : 'Find'}
            </button>
          </form>
          {member && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{member.firstName} {member.lastName}</p>
                <p className="text-sm text-gray-500">{member.memberCode} · {member.memberType}</p>
              </div>
              <span className="text-green-600 font-bold text-xl">✓</span>
            </div>
          )}
        </div>

        {/* Pending Fines */}
        {member && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Step 2: Select Fine to Pay</h2>
            {pendingFines.length === 0 ? (
              <p className="text-center text-gray-500 py-6">🎉 This member has no pending fines!</p>
            ) : (
              <div className="space-y-3">
                {pendingFines.map(fine => (
                  <button
                    key={fine._id}
                    onClick={() => handleFineSelect(fine)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedFine?._id === fine._id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{fine.fineCode}</p>
                        <p className="text-sm text-gray-500">{fine.fineType?.replace('_', ' ')} · {fine.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{fine.pendingAmount}</p>
                        <p className="text-xs text-gray-500">pending</p>
                      </div>
                    </div>
                    {fine.status === 'PARTIAL' && (
                      <p className="text-xs text-yellow-600 mt-2 font-medium">Already paid ₹{fine.paidAmount}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment Form */}
        {selectedFine && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Step 3: Payment Details</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Amount (₹) <span className="font-normal text-gray-400">(Max: ₹{selectedFine.pendingAmount})</span>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={selectedFine.pendingAmount}
                  min={1}
                  className="w-full px-4 py-3 text-2xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
                {Number(amount) < selectedFine.pendingAmount && amount && (
                  <p className="text-xs text-yellow-600 mt-1 font-medium">⚠ Partial payment: ₹{selectedFine.pendingAmount - Number(amount)} will remain pending.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2.5 rounded-lg border-2 font-bold text-sm transition ${
                        paymentMethod === method
                          ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {(paymentMethod === 'UPI' || paymentMethod === 'BANK_TRANSFER') && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Transaction Reference ID</label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="UPI/Bank transaction reference..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg transition disabled:opacity-50"
              >
                {submitting ? 'Processing...' : `Confirm Payment of ₹${amount || 0}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePayment;
