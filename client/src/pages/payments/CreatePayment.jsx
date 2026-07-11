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
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">💵</span> Collect Fine Payment
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Search a member, select their fine, and record the payment.</p>
        </div>

        {/* Member Search */}
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 p-8 mb-8 relative z-10">
          <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider">Step 1: Find Member</h2>
          <form onSubmit={handleMemberSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Scan or enter Member ID..."
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              className="flex-1 px-5 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none shadow-inner transition-all font-bold"
              required
            />
            <button type="submit" disabled={searchLoading} className="px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white rounded-2xl hover:from-black hover:to-gray-900 transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5">
              {searchLoading ? 'Searching...' : 'Find Member'}
            </button>
          </form>
          {member && (
            <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex justify-between items-center shadow-sm">
              <div>
                <p className="font-extrabold text-gray-900 dark:text-white text-lg">{member.firstName} {member.lastName}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">{member.memberCode}</span>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">{member.memberType}</span>
                </div>
              </div>
              <span className="text-green-600 bg-green-100 dark:bg-green-800/50 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl shadow-sm">✓</span>
            </div>
          )}
        </div>

        {/* Pending Fines */}
        {member && (
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 p-8 mb-8 relative z-10">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider">Step 2: Select Fine to Pay</h2>
            {pendingFines.length === 0 ? (
              <div className="text-center py-10 bg-gray-50/50 dark:bg-gray-700/30 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                <span className="text-4xl mb-3 block">🎉</span>
                <p className="text-gray-600 dark:text-gray-400 font-bold">This member has no pending fines!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingFines.map(fine => (
                  <button
                    key={fine._id}
                    onClick={() => handleFineSelect(fine)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all transform hover:-translate-y-0.5 ${
                      selectedFine?._id === fine._id
                        ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300 hover:shadow-sm bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-black text-gray-900 dark:text-white text-lg">{fine.fineCode}</p>
                        <p className="text-sm font-bold text-gray-500 mt-1"><span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs mr-2">{fine.fineType?.replace('_', ' ')}</span> {fine.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-red-600 dark:text-red-400">₹{fine.pendingAmount}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">pending</p>
                      </div>
                    </div>
                    {fine.status === 'PARTIAL' && (
                      <div className="mt-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 text-xs font-bold px-3 py-1.5 rounded-lg inline-block border border-yellow-200 dark:border-yellow-800">
                        Already paid ₹{fine.paidAmount}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment Form */}
        {selectedFine && (
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 p-8 relative z-10 animate-fade-in">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider">Step 3: Payment Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Amount (₹) <span className="font-normal text-gray-400 ml-2 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">Max: ₹{selectedFine.pendingAmount}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-black text-gray-400">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={selectedFine.pendingAmount}
                    min={1}
                    className="w-full pl-10 pr-4 py-4 text-3xl font-black border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none shadow-inner transition-all"
                    required
                  />
                </div>
                {Number(amount) < selectedFine.pendingAmount && amount && (
                  <p className="text-sm text-yellow-600 mt-2 font-bold flex items-center bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <span className="mr-2">⚠</span> Partial payment: ₹{selectedFine.pendingAmount - Number(amount)} will remain pending.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Payment Method</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-4 rounded-xl border-2 font-black text-sm transition-all transform hover:-translate-y-0.5 ${
                        paymentMethod === method
                          ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 bg-white dark:bg-gray-800'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {(paymentMethod === 'UPI' || paymentMethod === 'BANK_TRANSFER') && (
                <div className="animate-fade-in bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-200 dark:border-gray-600">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Transaction Reference ID</label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. UTR1234567890..."
                    className="w-full px-5 py-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none shadow-inner"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:-translate-y-1 flex justify-center items-center gap-3"
                >
                  {submitting ? 'Processing...' : (
                    <>
                      <span>✓</span> Confirm Payment of ₹{amount || 0}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePayment;
