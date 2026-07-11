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
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
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
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            New Transfer
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 overflow-hidden relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/50 border-b border-gray-100 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
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
                    <tr key={transfer._id} className="hover:bg-white/90 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {transfer.bookCopy?.copyCode || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{transfer.fromBranch?.branchName || 'Unknown'}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{transfer.toBranch?.branchName || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 text-xs font-black rounded-lg shadow-sm border ${
                          transfer.status === 'REQUESTED' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/50 dark:text-yellow-400' :
                          transfer.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700/50 dark:text-blue-400' :
                          transfer.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:border-purple-700/50 dark:text-purple-400' :
                          'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:border-green-700/50 dark:text-green-400'
                        }`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {transfer.status === 'REQUESTED' && (
                          <button onClick={() => updateStatus(transfer._id, 'approve')} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:shadow-md rounded-xl text-sm font-bold transition-all">Approve</button>
                        )}
                        {transfer.status === 'APPROVED' && (
                          <button onClick={() => updateStatus(transfer._id, 'transit')} className="px-4 py-2 bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:shadow-md rounded-xl text-sm font-bold transition-all">Mark Transit</button>
                        )}
                        {transfer.status === 'IN_TRANSIT' && (
                          <button onClick={() => updateStatus(transfer._id, 'receive')} className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:shadow-md rounded-xl text-sm font-bold transition-all">Receive</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-2xl dark:bg-gray-800/90 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Request Book Transfer</h2>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">From Branch</label>
                <select 
                  required
                  value={formData.fromBranch}
                  onChange={(e) => setFormData({...formData, fromBranch: e.target.value})}
                  className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm"
                >
                  <option value="">Select Origin Branch</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.branchName || b.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">To Branch</label>
                <select 
                  required
                  value={formData.toBranch}
                  onChange={(e) => setFormData({...formData, toBranch: e.target.value})}
                  className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm"
                >
                  <option value="">Select Destination Branch</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.branchName || b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Book Copy ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="Paste BookCopy Object ID here"
                  value={formData.bookCopy}
                  onChange={(e) => setFormData({...formData, bookCopy: e.target.value})}
                  className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">In a real app, this would be a searchable dropdown.</p>
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/50">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">Request Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TransferCenter;
