import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refundReason, setRefundReason] = useState('');
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/v1/payments/${id}`);
      if (res.data.success) {
        setPayment(res.data.data);
        setReceipt(res.data.receipt);
      }
    } catch (err) {
      toast.error('Failed to load payment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayment(); }, [id]);

  const handleRefund = async (e) => {
    e.preventDefault();
    if (!refundReason) return toast.error("Reason is required");
    setRefundSubmitting(true);
    try {
      const res = await api.post(`/v1/payments/${id}/refund`, { reason: refundReason });
      if (res.data.success) {
        toast.success('Refund processed!');
        setRefundModalOpen(false);
        fetchPayment();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund failed');
    } finally {
      setRefundSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!receipt) return;
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
      <html>
        <head><title>Payment Receipt - ${receipt.receiptNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 500px; margin: 0 auto; }
          h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .label { color: #666; font-size: 13px; }
          .value { font-weight: bold; font-size: 13px; }
          .total { font-size: 20px; font-weight: bold; color: #16a34a; }
          .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
        </style>
        </head>
        <body>
          <h1>📚 LibraryOS — Fine Receipt</h1>
          <div class="row"><span class="label">Receipt No.</span><span class="value">${receipt.receiptNumber}</span></div>
          <div class="row"><span class="label">Member</span><span class="value">${receipt.issuedTo} (${receipt.memberCode})</span></div>
          <div class="row"><span class="label">Fine Code</span><span class="value">${receipt.fineCode}</span></div>
          <div class="row"><span class="label">Fine Type</span><span class="value">${receipt.fineType?.replace('_', ' ')}</span></div>
          <div class="row"><span class="label">Payment Method</span><span class="value">${receipt.paymentMethod}</span></div>
          ${receipt.transactionRef ? `<div class="row"><span class="label">Ref. No.</span><span class="value">${receipt.transactionRef}</span></div>` : ''}
          <div class="row"><span class="label">Date</span><span class="value">${new Date(receipt.paymentDate).toLocaleString()}</span></div>
          <div class="row" style="margin-top:10px"><span class="label">Amount Paid</span><span class="total">₹${receipt.amountPaid}</span></div>
          <div class="footer">Thank you! This is a system-generated receipt. — LibraryOS</div>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  if (loading) return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;
  if (!payment) return <div className="p-12 text-center text-gray-500">Payment not found.</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Link to="/payments" className="text-sm text-blue-600 hover:underline mb-4 inline-block">← Back to Payments</Link>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Details</h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400 font-mono">{payment.paymentCode}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handlePrintReceipt} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm">
              🖨 Print Receipt
            </button>
            {payment.status === 'SUCCESS' && (
              <button onClick={() => setRefundModalOpen(true)} className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium text-sm">
                ↩ Refund
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Member</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{payment.memberId?.firstName} {payment.memberId?.lastName}</p>
              <p className="text-sm text-gray-500">{payment.memberId?.memberCode}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount Paid</p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-1">₹{payment.amount}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Method</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{payment.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
              <span className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-bold ${
                payment.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                payment.status === 'REFUNDED' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>{payment.status}</span>
            </div>
            {payment.transactionId && (
              <div className="col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction Ref.</p>
                <p className="text-gray-900 dark:text-white font-mono mt-1">{payment.transactionId}</p>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recorded On</p>
              <p className="text-gray-900 dark:text-white mt-1">{new Date(payment.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {refundModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Process Refund</h2>
              <button onClick={() => setRefundModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleRefund} className="p-6">
              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4 dark:text-red-400">
                ⚠ This will refund ₹{payment.amount} and restore the fine balance.
              </p>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Reason</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows="3"
                placeholder="Reason for refund..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 mb-6"
                required
              ></textarea>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setRefundModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={refundSubmitting} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg disabled:opacity-50">
                  {refundSubmitting ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;
