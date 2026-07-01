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
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">💳</span> Fine Payments
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Track all fine collections, partial payments, and refunds.</p>
          </div>
          <Link to="/payments/new" className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center font-medium shadow-sm">
            <span className="mr-2">➕</span> Collect Payment
          </Link>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Today's Revenue</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">₹{revenue.todayRevenue}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">This Month</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{revenue.monthRevenue}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Collected</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{revenue.totalRevenue}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Refunds</p>
            <p className="text-3xl font-bold text-red-500 dark:text-red-400">{revenue.refundsCount}</p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="p-4 font-medium">Payment Code</th>
                    <th className="p-4 font-medium">Member</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Method</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No payment records found.
                      </td>
                    </tr>
                  ) : (
                    payments.map(pay => (
                      <tr key={pay._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="p-4 font-mono font-bold text-gray-900 dark:text-white">{pay.paymentCode}</td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900 dark:text-white">{pay.memberId?.firstName} {pay.memberId?.lastName}</div>
                          <div className="text-xs text-gray-500">{pay.memberId?.memberCode}</div>
                        </td>
                        <td className="p-4 text-xl font-bold text-green-600 dark:text-green-400">₹{pay.amount}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${methodColors[pay.paymentMethod] || 'bg-gray-100 text-gray-700'}`}>
                            {pay.paymentMethod}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            pay.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                            pay.status === 'REFUNDED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {pay.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">
                          {new Date(pay.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <Link to={`/payments/${pay._id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium">
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
