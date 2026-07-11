import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, FileText, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AuditDashboard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAuditName, setNewAuditName] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/v1/inventory-audit');
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load audit sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAudit = async (e) => {
    e.preventDefault();
    if (!newAuditName.trim()) return;
    
    try {
      const res = await api.post('/v1/inventory-audit/start', { name: newAuditName });
      if (res.data.success) {
        toast.success('Audit session started!');
        navigate(`/inventory/audit/${res.data.data._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start audit session');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-8 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-blue-500" />
            Inventory Audit (Stock Verification)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Conduct shelf-by-shelf barcode scanning to find missing or misplaced books.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Start New Audit
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading audit history...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <div key={session._id} className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 overflow-hidden hover:-translate-y-1 transition-all group">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-white/50 dark:bg-gray-800/50">
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-xl">{session.name}</h3>
                  <p className="text-sm font-bold text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Started: {new Date(session.startDate).toLocaleDateString()}
                  </p>
                </div>
                {session.status === "IN_PROGRESS" ? (
                  <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-bold rounded-full border border-yellow-200 dark:border-yellow-800 shadow-sm">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full border border-green-200 dark:border-green-800 flex items-center gap-1 shadow-sm">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </span>
                )}
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-700">
                <div className="text-center">
                  <div className="font-black text-blue-600 dark:text-blue-400 text-2xl">{session.totalScanned}</div>
                  <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">Scanned</div>
                </div>
                <div className="text-center">
                  <div className="font-black text-red-600 dark:text-red-400 text-2xl">{session.totalMissing}</div>
                  <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">Missing</div>
                </div>
                <div className="text-center">
                  <div className="font-black text-orange-600 dark:text-orange-400 text-2xl">{session.totalMisplaced}</div>
                  <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">Misplaced</div>
                </div>
              </div>
              <div className="p-5">
                <button
                  onClick={() => navigate(`/inventory/audit/${session._id}`)}
                  className={`w-full py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-sm
                    ${session.status === "IN_PROGRESS" 
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50" 
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"}`}
                >
                  <FileText className="w-5 h-5" />
                  {session.status === "IN_PROGRESS" ? "Continue Audit" : "View Report"}
                </button>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Audits Found</h3>
              <p className="text-gray-500 mt-1">Start a new stock verification to see it here.</p>
            </div>
          )}
        </div>
      )}

      {/* New Audit Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-white/90 backdrop-blur-xl dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl border border-white/50 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Start New Audit Session</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">Name this verification session (e.g. Annual Audit 2026)</p>
            </div>
            <form onSubmit={handleStartAudit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Session Name
                </label>
                <input
                  type="text"
                  value={newAuditName}
                  onChange={(e) => setNewAuditName(e.target.value)}
                  placeholder="e.g., Annual Stock Verification 2026"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-inner"
                  autoFocus
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newAuditName.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold disabled:opacity-50 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Start Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditDashboard;
