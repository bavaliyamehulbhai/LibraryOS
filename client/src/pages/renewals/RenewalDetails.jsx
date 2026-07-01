import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RenewalDetails = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        // We can reuse the issue details endpoint since a renewal is just an issue transaction
        const res = await api.get(`/v1/issues/${id}`);
        if (res.data.success) {
          setRecord(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  if (loading || !record) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/renewals/history" className="text-sm text-blue-600 hover:underline mb-2 inline-block">← Back to History</Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            Renewal Details
          </h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">Transaction Code: {record.transactionCode}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-gray-100 dark:border-gray-700 pb-8 mb-8">
            <div>
              <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-4">Member Info</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{record.memberId?.firstName} {record.memberId?.lastName}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">ID: {record.memberId?.memberCode}</p>
            </div>
            <div>
              <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-4">Book Info</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{record.bookId?.title}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Barcode: {record.bookCopyId?.barcode}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Timeline</h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg space-y-4">
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-4">
                <span className="font-medium text-gray-600 dark:text-gray-300">Original Issue Date</span>
                <span className="font-bold text-gray-900 dark:text-white">{new Date(record.issueDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="font-medium text-gray-600 dark:text-gray-300">Current Due Date</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{new Date(record.dueDate).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {record.renewalHistory && record.renewalHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Renewal History Log ({record.renewalCount} total)</h3>
              <div className="space-y-4">
                {record.renewalHistory.map((history, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                    <div>
                      <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block mb-1">Renewal #{idx + 1}</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Shifted due date from <span className="font-bold">{new Date(history.oldDueDate).toLocaleDateString()}</span> to <span className="font-bold">{new Date(history.newDueDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                      Processed on:<br/>
                      {new Date(history.renewedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default RenewalDetails;
