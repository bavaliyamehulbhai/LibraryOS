import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Fines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Waive Modal State
  const [waiveModalOpen, setWaiveModalOpen] = useState(false);
  const [waiveFineId, setWaiveFineId] = useState(null);
  const [waiveReason, setWaiveReason] = useState("");
  const [waiveSubmitting, setWaiveSubmitting] = useState(false);

  // Manual Fine Modal State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualMemberCode, setManualMemberCode] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/fines');
      if (res.data.success) {
        setFines(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const openWaiveModal = (id) => {
    setWaiveFineId(id);
    setWaiveReason("");
    setWaiveModalOpen(true);
  };

  const handleWaiveSubmit = async (e) => {
    e.preventDefault();
    if (!waiveReason) return toast.error("Reason is required");
    
    setWaiveSubmitting(true);
    try {
      const res = await api.put(`/v1/fines/${waiveFineId}/waive`, { reason: waiveReason });
      if (res.data.success) {
        toast.success("Fine waived successfully!");
        setWaiveModalOpen(false);
        fetchFines();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to waive fine');
    } finally {
      setWaiveSubmitting(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualMemberCode || !manualAmount || !manualReason) return toast.error("All fields required");
    
    setManualSubmitting(true);
    try {
      // Find Member ID first
      const memRes = await api.get(`/v1/members?search=${manualMemberCode}`);
      const member = memRes.data?.data?.find(m => m.memberCode === manualMemberCode);
      
      if (!member) {
        toast.error("Member not found with this ID.");
        setManualSubmitting(false);
        return;
      }

      const res = await api.post('/v1/fines/manual', {
        memberId: member._id,
        amount: Number(manualAmount),
        reason: manualReason
      });

      if (res.data.success) {
        toast.success("Manual fine generated!");
        setManualModalOpen(false);
        fetchFines();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create fine');
    } finally {
      setManualSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">💰</span> Fine Management
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Track penalties, manage waivers, and enforce compliance.</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => {
                setManualMemberCode(""); setManualAmount(""); setManualReason(""); setManualModalOpen(true);
              }} 
              className="px-5 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition flex items-center font-medium shadow-sm"
            >
              <span className="mr-2">➕</span> Manual Fine
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Pending</h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              ₹{fines.filter(f => f.status === 'PENDING' || f.status === 'PARTIAL').reduce((acc, f) => acc + f.pendingAmount, 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Collected</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              ₹{fines.reduce((acc, f) => acc + f.paidAmount, 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Waived</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {fines.filter(f => f.status === 'WAIVED').length} Fines
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="p-4 font-medium">Fine Code</th>
                    <th className="p-4 font-medium">Member</th>
                    <th className="p-4 font-medium">Type & Reason</th>
                    <th className="p-4 font-medium">Total</th>
                    <th className="p-4 font-medium">Pending</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                  {fines.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No fine records found.
                      </td>
                    </tr>
                  ) : (
                    fines.map(fine => (
                      <tr key={fine._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="p-4 font-mono font-bold text-gray-900 dark:text-white">{fine.fineCode}</td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900 dark:text-white">{fine.memberId?.firstName} {fine.memberId?.lastName}</div>
                          <div className="text-xs text-gray-500">{fine.memberId?.memberCode}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900 dark:text-white">{fine.fineType.replace('_', ' ')}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{fine.reason}</div>
                        </td>
                        <td className="p-4 font-bold text-gray-900 dark:text-white">₹{fine.amount}</td>
                        <td className="p-4 font-bold text-red-600 dark:text-red-400">₹{fine.pendingAmount}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                            fine.status === 'PAID' ? 'bg-green-100 text-green-700' :
                            fine.status === 'PENDING' ? 'bg-red-100 text-red-700' :
                            fine.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {fine.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-3">
                          {(fine.status === 'PENDING' || fine.status === 'PARTIAL') && (
                            <button onClick={() => openWaiveModal(fine._id)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-bold transition">
                              Waive
                            </button>
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
      </div>

      {/* Waive Modal */}
      {waiveModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Waive Fine</h2>
              <button onClick={() => setWaiveModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleWaiveSubmit} className="p-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Reason for Waiver</label>
              <textarea 
                value={waiveReason}
                onChange={(e) => setWaiveReason(e.target.value)}
                placeholder="e.g. Medical emergency, admin approval..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-6"
                rows="3"
                required
              ></textarea>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setWaiveModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={waiveSubmitting} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50">
                  {waiveSubmitting ? 'Processing...' : 'Confirm Waiver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Fine Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Manual Fine</h2>
              <button onClick={() => setManualModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleManualSubmit} className="p-6">
              
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Member ID</label>
              <input 
                type="text"
                value={manualMemberCode}
                onChange={(e) => setManualMemberCode(e.target.value)}
                placeholder="LIB-2026-..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-4"
                required
              />

              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Amount (₹)</label>
              <input 
                type="number"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="50"
                min="1"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-4"
                required
              />

              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Reason</label>
              <textarea 
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                placeholder="e.g. Library rule violation..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-6"
                rows="2"
                required
              ></textarea>

              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setManualModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={manualSubmitting} className="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
                  {manualSubmitting ? 'Creating...' : 'Create Fine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Fines;
