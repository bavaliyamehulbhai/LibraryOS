import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const BranchDetails = () => {
  const { id } = useParams();
  const [branch, setBranch] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        setLoading(true);
        const [branchRes, dashRes] = await Promise.all([
          api.get(`/v1/branches/${id}`),
          api.get(`/v1/branches/${id}/dashboard`)
        ]);
        
        if (branchRes.data.success) {
          setBranch(branchRes.data.data);
        }
        if (dashRes.data.success) {
          setDashboard(dashRes.data.data);
        }
      } catch (error) {
        toast.error('Failed to load branch details');
      } finally {
        setLoading(false);
      }
    };
    fetchBranchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!branch) {
    return <div className="p-8">Branch not found</div>;
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/branches" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium mb-2 inline-block">&larr; Back to Branches</Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              {branch.branchName || branch.name}
              <span className="ml-3 px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full uppercase">
                {branch.branchCode}
              </span>
            </h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400">
              {branch.address?.city || branch.city}, {branch.address?.state || branch.state}
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              to={`/branches/transfer?branchId=${branch._id}`}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
            >
              Transfer Books
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Books</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{dashboard.booksCount}</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Members</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{dashboard.membersCount}</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Staff</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{dashboard.staffCount}</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Est. Revenue</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">₹{dashboard.revenue.toLocaleString()}</h2>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BranchDetails;
