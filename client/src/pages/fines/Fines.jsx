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
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen relative">
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
              className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white rounded-xl hover:from-black hover:to-gray-900 transition-all font-bold shadow-md hover:shadow-lg flex items-center hover:-translate-y-0.5"
            >
              <span className="mr-2">➕</span> Manual Fine
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-8 rounded-3xl border border-white/50 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-300">
              <span className="text-6xl">🔴</span>
            </div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 relative z-10">Total Pending</h3>
            <p className="text-5xl font-black text-red-600 dark:text-red-400 relative z-10">
              ₹{fines.filter(f => f.status === 'PENDING' || f.status === 'PARTIAL').reduce((acc, f) => acc + f.pendingAmount, 0)}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-8 rounded-3xl border border-white/50 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-300">
              <span className="text-6xl">🟢</span>
            </div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 relative z-10">Total Collected</h3>
            <p className="text-5xl font-black text-green-600 dark:text-green-400 relative z-10">
              ₹{fines.reduce((acc, f) => acc + f.paidAmount, 0)}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-8 rounded-3xl border border-white/50 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-300">
              <span className="text-6xl">⚪</span>
            </div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 relative z-10">Total Waived</h3>
            <p className="text-5xl font-black text-gray-900 dark:text-white relative z-10">
              {fines.filter(f => f.status === 'WAIVED').length} <span className="text-xl text-gray-400">Fines</span>
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 overflow-hidden relative z-10">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-200 dark:border-gray-700">
                    <th className="p-5">Fine Code</th>
                    <th className="p-5">Member</th>
                    <th className="p-5">Type & Reason</th>
                    <th className="p-5">Total</th>
                    <th className="p-5">Pending</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 text-sm">
                  {fines.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No fine records found.
                      </td>
                    </tr>
                  ) : (
                    fines.map(fine => (
                      <tr key={fine._id} className="hover:bg-white/90 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 group">
                        <td className="p-5 font-mono font-bold text-gray-900 dark:text-white">{fine.fineCode}</td>
                        <td className="p-5">
                          <div className="font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{fine.memberId?.firstName} {fine.memberId?.lastName}</div>
                          <div className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 inline-block px-2 py-0.5 rounded mt-1">{fine.memberId?.memberCode}</div>
                        </td>
                        <td className="p-5">
                          <div className="font-bold text-gray-900 dark:text-white">{fine.fineType.replace('_', ' ')}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{fine.reason}</div>
                        </td>
                        <td className="p-5 font-black text-gray-900 dark:text-white text-lg">₹{fine.amount}</td>
                        <td className="p-5 font-black text-red-600 dark:text-red-400 text-lg">₹{fine.pendingAmount}</td>
                        <td className="p-5">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm border ${
                            fine.status === 'PAID' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30' :
                            fine.status === 'PENDING' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30' :
                            fine.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30' :
                            'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {fine.status}
                          </span>
                        </td>
                        <td className="p-5 text-right space-x-2">
                          {(fine.status === 'PENDING' || fine.status === 'PARTIAL') && (
                            <button onClick={() => openWaiveModal(fine._id)} className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/50 rounded-lg font-bold text-sm transition-all shadow-sm">
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
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-xl dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-white/50 dark:border-gray-700 transform scale-100">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2"><span className="text-2xl">🪄</span> Waive Fine</h2>
              <button onClick={() => setWaiveModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">✕</button>
            </div>
            <form onSubmit={handleWaiveSubmit} className="p-8">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Reason for Waiver</label>
              <textarea 
                value={waiveReason}
                onChange={(e) => setWaiveReason(e.target.value)}
                placeholder="e.g. Medical emergency, admin approval..."
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 mb-6 shadow-inner outline-none transition-all"
                rows="3"
                required
              ></textarea>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setWaiveModalOpen(false)} className="px-6 py-3 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-bold dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all shadow-sm">Cancel</button>
                <button type="submit" disabled={waiveSubmitting} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5">
                  {waiveSubmitting ? 'Processing...' : 'Confirm Waiver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Fine Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-xl dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-white/50 dark:border-gray-700 transform scale-100">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-slate-50/50 dark:from-gray-800/10 dark:to-slate-800/10">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2"><span className="text-2xl">➕</span> Create Manual Fine</h2>
              <button onClick={() => setManualModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">✕</button>
            </div>
            <form onSubmit={handleManualSubmit} className="p-8">
              
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Member ID</label>
              <input 
                type="text"
                value={manualMemberCode}
                onChange={(e) => setManualMemberCode(e.target.value)}
                placeholder="LIB-2026-..."
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 mb-4 shadow-inner outline-none transition-all"
                required
              />

              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Amount (₹)</label>
              <input 
                type="number"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="50"
                min="1"
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 mb-4 shadow-inner outline-none transition-all font-black text-lg"
                required
              />

              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Reason</label>
              <textarea 
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                placeholder="e.g. Library rule violation..."
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 mb-6 shadow-inner outline-none transition-all"
                rows="2"
                required
              ></textarea>

              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setManualModalOpen(false)} className="px-6 py-3 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-bold dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all shadow-sm">Cancel</button>
                <button type="submit" disabled={manualSubmitting} className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white font-bold rounded-xl hover:from-black hover:to-gray-900 transition-all shadow-md hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5">
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
