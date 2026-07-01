import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const IssueDetails = () => {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/v1/issues/${id}`);
        if (res.data.success) {
          setIssue(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id]);

  if (loading || !issue) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  const isOverdue = new Date() > new Date(issue.dueDate) && issue.status !== 'RETURNED';

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <Link to="/issues" className="text-sm text-blue-600 hover:underline mb-2 inline-block print:hidden">← Back to Circulation</Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              Receipt: {issue.transactionCode}
            </h1>
          </div>
          <div>
            <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider ${
              issue.status === 'ISSUED' && !isOverdue ? 'bg-blue-100 text-blue-700' :
              isOverdue ? 'bg-red-100 text-red-700' :
              'bg-green-100 text-green-700'
            }`}>
              {isOverdue ? 'OVERDUE' : issue.status}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-gray-100 dark:border-gray-700 pb-8 mb-8">
            {/* Member Info */}
            <div>
              <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-4">Issued To</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{issue.memberId?.firstName} {issue.memberId?.lastName}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">ID: {issue.memberId?.memberCode}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{issue.memberId?.email}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{issue.memberId?.phone}</p>
            </div>

            {/* Book Info */}
            <div>
              <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-4">Book Details</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{issue.bookId?.title}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Author: {issue.bookId?.authors?.join(', ')}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Copy Barcode: {issue.bookCopyId?.barcode}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Condition: {issue.bookCopyId?.condition}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Issue Date</p>
              <p className="font-bold text-gray-900 dark:text-white">{new Date(issue.issueDate).toLocaleDateString()}</p>
            </div>
            <div className={`p-4 rounded-lg ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Due Date</p>
              <p className={`font-bold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {new Date(issue.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Renewals Left</p>
              <p className="font-bold text-gray-900 dark:text-white">{issue.maxRenewals - (issue.renewalCount || 0)}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Issued By</p>
              <p className="font-bold text-gray-900 dark:text-white">{issue.issuedBy?.name || 'System'}</p>
            </div>
          </div>
          
          <div className="mt-12 flex justify-center print:hidden">
            <button 
              onClick={() => window.print()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition">
              Print Receipt
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
