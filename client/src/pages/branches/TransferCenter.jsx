import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const TransferCenter = () => {
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get('branchId');
  
  const [transfers, setTransfers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fromBranch: branchId || '',
    toBranch: '',
    bookCopy: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transfersRes, branchesRes] = await Promise.all([
        api.get('/v1/transfers' + (branchId ? `?branchId=${branchId}` : '')),
        api.get('/v1/branches')
      ]);
      
      if (transfersRes.data.success) {
        setTransfers(transfersRes.data.data);
      }
      if (branchesRes.data.success) {
        setBranches(branchesRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchId]);

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/v1/transfers', formData);
      if (res.data.success) {
        toast.success('Transfer requested successfully!');
        setShowModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request transfer');
    }
  };

  const updateStatus = async (id, action) => {
    try {
      const res = await api.put(`/v1/transfers/${id}/${action}`);
      if (res.data.success) {
        toast.success(`Transfer ${action}d successfully`);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} transfer`);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">🔄</span> Transfer Center
            </h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400">Manage book copy transfers between branches.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm"
          >
            New Transfer
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                  <th className="px-6 py-4">Book Copy</th>
                  <th className="px-6 py-4">From Branch</th>
                  <th className="px-6 py-4">To Branch</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No transfers found.</td>
                  </tr>
                ) : (
                  transfers.map(transfer => (
                    <tr key={transfer._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {transfer.bookCopy?.copyCode || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{transfer.fromBranch?.branchName || 'Unknown'}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{transfer.toBranch?.branchName || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          transfer.status === 'REQUESTED' ? 'bg-yellow-100 text-yellow-800' :
                          transfer.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                          transfer.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {transfer.status === 'REQUESTED' && (
                          <button onClick={() => updateStatus(transfer._id, 'approve')} className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-sm font-medium">Approve</button>
                        )}
                        {transfer.status === 'APPROVED' && (
                          <button onClick={() => updateStatus(transfer._id, 'transit')} className="px-3 py-1 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded text-sm font-medium">Mark Transit</button>
                        )}
                        {transfer.status === 'IN_TRANSIT' && (
                          <button onClick={() => updateStatus(transfer._id, 'receive')} className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-sm font-medium">Receive</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Request Book Transfer</h2>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Branch</label>
                <select 
                  required
                  value={formData.fromBranch}
                  onChange={(e) => setFormData({...formData, fromBranch: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Origin Branch</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.branchName || b.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Branch</label>
                <select 
                  required
                  value={formData.toBranch}
                  onChange={(e) => setFormData({...formData, toBranch: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Destination Branch</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.branchName || b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Book Copy ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="Paste BookCopy Object ID here"
                  value={formData.bookCopy}
                  onChange={(e) => setFormData({...formData, bookCopy: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">In a real app, this would be a searchable dropdown.</p>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium">Request Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TransferCenter;
