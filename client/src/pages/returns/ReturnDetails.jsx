import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getApiUrl } from '../../services/runtimeConfig';

const ReturnDetails = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturn = async () => {
      try {
        setLoading(true);
        // Note: For now we can use the same issue details endpoint since it fetches Transaction
        const res = await api.get(`/v1/issues/${id}`);
        if (res.data.success) {
          setRecord(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load return details');
      } finally {
        setLoading(false);
      }
    };
    fetchReturn();
  }, [id]);

  const handlePrint = () => {
    window.open(`${getApiUrl()}/v1/returns/${id}/print`, '_blank');
  };

  if (loading || !record) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <Link to="/issues" className="text-sm text-blue-600 hover:underline mb-2 inline-block print:hidden">← Back to Circulation</Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              Return Receipt: {record.transactionCode}
            </h1>
          </div>
          <div>
            <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider ${
              record.fineAmount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {record.fineAmount > 0 ? 'FINE GENERATED' : 'CLEARED'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-gray-100 dark:border-gray-700 pb-8 mb-8">
            {/* Member Info */}
            <div>
              <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-4">Returned By</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{record.memberId?.firstName} {record.memberId?.lastName}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">ID: {record.memberId?.memberCode}</p>
            </div>

            {/* Book Info */}
            <div>
              <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-4">Book Details</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{record.bookId?.title}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Copy Barcode: {record.bookCopyId?.barcode}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Return Condition: <span className="font-bold">{record.returnCondition}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-8">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Issue Date</p>
              <p className="font-bold text-gray-900 dark:text-white">{new Date(record.issueDate).toLocaleDateString()}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Due Date</p>
              <p className="font-bold text-gray-900 dark:text-white">{new Date(record.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Returned On</p>
              <p className="font-bold text-blue-700 dark:text-blue-400">{new Date(record.actualReturnDate).toLocaleDateString()}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Late Days</p>
              <p className="font-bold text-gray-900 dark:text-white">{record.lateDays || 0}</p>
            </div>
          </div>

          {/* Fine Banner */}
          {record.fineAmount > 0 ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex justify-between items-center">
              <div>
                <h4 className="text-red-800 dark:text-red-400 font-bold text-lg">Penalty Assessed</h4>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">This user has been charged for late return or damage.</p>
              </div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                ₹{record.fineAmount}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 flex justify-between items-center">
              <div>
                <h4 className="text-green-800 dark:text-green-400 font-bold text-lg">No Fines</h4>
                <p className="text-green-600 dark:text-green-300 text-sm mt-1">Book was returned on time and in good condition.</p>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ₹0
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-center print:hidden">
            <button onClick={handlePrint} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition">
              Print Return Receipt PDF
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReturnDetails;
