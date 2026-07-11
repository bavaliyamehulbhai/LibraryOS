import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState({ todayRevenue: 0, monthRevenue: 0, totalRevenue: 0, refundsCount: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, dashRes] = await Promise.all([
        api.get('/v1/payments'),
        api.get('/v1/payments/dashboard')
      ]);
      if (paymentsRes.data.success) setPayments(paymentsRes.data.data);
      if (dashRes.data.success) setRevenue(dashRes.data.data);
    } catch (error) {
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const methodColors = {
    CASH: 'bg-green-100 text-green-700',
    UPI: 'bg-blue-100 text-blue-700',
    CARD: 'bg-purple-100 text-purple-700',
    RAZORPAY: 'bg-orange-100 text-orange-700',
    BANK_TRANSFER: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">💳</span> Fine Payments
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Track all fine collections, partial payments, and refunds.</p>
          </div>
          <Link to="/payments/new" className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center hover:-translate-y-0.5">
            <span className="mr-2 text-lg">➕</span> Collect Payment
          </Link>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-8 rounded-3xl border border-white/50 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-300">
              <span className="text-6xl">💸</span>
            </div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 relative z-10">Today's Revenue</p>
            <p className="text-5xl font-black text-green-600 dark:text-green-400 relative z-10">₹{revenue.todayRevenue}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-8 rounded-3xl border border-white/50 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-300">
              <span className="text-6xl">📅</span>
            </div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 relative z-10">This Month</p>
            <p className="text-5xl font-black text-blue-600 dark:text-blue-400 relative z-10">₹{revenue.monthRevenue}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-8 rounded-3xl border border-white/50 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-300">
              <span className="text-6xl">💰</span>
            </div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 relative z-10">Total Collected</p>
            <p className="text-5xl font-black text-gray-900 dark:text-white relative z-10">₹{revenue.totalRevenue}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-8 rounded-3xl border border-white/50 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-300">
              <span className="text-6xl">↩️</span>
            </div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 relative z-10">Refunds</p>
            <p className="text-5xl font-black text-red-500 dark:text-red-400 relative z-10">{revenue.refundsCount}</p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 overflow-hidden relative z-10">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-200 dark:border-gray-700">
                    <th className="p-5">Payment Code</th>
                    <th className="p-5">Member</th>
                    <th className="p-5">Amount</th>
                    <th className="p-5">Method</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Date</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 text-sm">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No payment records found.
                      </td>
                    </tr>
                  ) : (
                    payments.map(pay => (
                      <tr key={pay._id} className="hover:bg-white/90 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 group">
                        <td className="p-5 font-mono font-bold text-gray-900 dark:text-white">{pay.paymentCode}</td>
                        <td className="p-5">
                          <div className="font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{pay.memberId?.firstName} {pay.memberId?.lastName}</div>
                          <div className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 inline-block px-2 py-0.5 rounded mt-1">{pay.memberId?.memberCode}</div>
                        </td>
                        <td className="p-5 text-2xl font-black text-green-600 dark:text-green-400">₹{pay.amount}</td>
                        <td className="p-5">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase shadow-sm border ${methodColors[pay.paymentMethod] ? methodColors[pay.paymentMethod] + ' border-opacity-50' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            {pay.paymentMethod}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase shadow-sm border ${
                            pay.status === 'SUCCESS' ? 'bg-green-100 text-green-700 border-green-200' :
                            pay.status === 'REFUNDED' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                          }`}>
                            {pay.status}
                          </span>
                        </td>
                        <td className="p-5 text-gray-600 dark:text-gray-300 font-medium">
                          {new Date(pay.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-5 text-right">
                          <Link to={`/payments/${pay._id}`} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50 rounded-lg font-bold text-sm transition-all shadow-sm">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;
