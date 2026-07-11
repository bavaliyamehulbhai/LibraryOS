import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AttendanceDashboard = () => {
  const [activeData, setActiveData] = useState({ members: [], visitors: [], totalActive: 0 });
  const [loading, setLoading] = useState(true);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  
  const [visitorForm, setVisitorForm] = useState({
    name: '', phone: '', purpose: '', idProof: '', idNumber: ''
  });

  const fetchActive = async () => {
    try {
      const res = await api.get('/v1/attendance/active');
      if (res.data.success) {
        setActiveData(res.data.data);
      }
    } catch (error) {
      console.error("Attendance API Error:", error);
      toast.error(error.response?.data?.message || 'Failed to load active attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 10000); // Auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/v1/attendance/visitor', visitorForm);
      if (res.data.success) {
        toast.success(res.data.message);
        setShowVisitorModal(false);
        setVisitorForm({ name: '', phone: '', purpose: '', idProof: '', idNumber: '' });
        fetchActive();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register visitor');
    }
  };

  const handleVisitorOut = async (id) => {
    try {
      const res = await api.post(`/v1/attendance/visitor/${id}/out`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchActive();
      }
    } catch (error) {
      toast.error('Failed to punch out visitor');
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-8 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 gap-4 relative z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span>👥</span> Live Library Attendance
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Currently Inside: <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{activeData.totalActive}</span>
          </p>
        </div>
        <button 
          onClick={() => setShowVisitorModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          + Register Visitor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Members Column */}
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 overflow-hidden flex flex-col hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300">
          <div className="p-6 border-b border-white/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10">
            <h2 className="font-bold text-gray-900 dark:text-white flex justify-between">
              Active Members
              <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-3 py-0.5 rounded-full text-sm">
                {activeData.members.length}
              </span>
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[60vh] overflow-y-auto">
            {activeData.members.length === 0 ? (
              <div className="p-12 text-center text-gray-500 font-medium">No members currently inside.</div>
            ) : (
              activeData.members.map(log => (
                <div key={log._id} className="p-5 flex items-center gap-4 hover:bg-white/90 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/60 dark:to-indigo-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-black text-lg uppercase shrink-0 shadow-inner">
                    {log.user?.firstName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {log.user?.firstName} {log.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{log.user?.email}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500 shrink-0">
                    <div className="font-medium text-green-600 dark:text-green-400">IN</div>
                    {format(new Date(log.entryTime), 'h:mm a')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Visitors Column */}
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 overflow-hidden flex flex-col hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300">
          <div className="p-6 border-b border-white/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-900/10">
            <h2 className="font-bold text-gray-900 dark:text-white flex justify-between">
              Active Visitors
              <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 px-3 py-0.5 rounded-full text-sm">
                {activeData.visitors.length}
              </span>
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[60vh] overflow-y-auto">
            {activeData.visitors.length === 0 ? (
              <div className="p-12 text-center text-gray-500 font-medium">No visitors currently inside.</div>
            ) : (
              activeData.visitors.map(visitor => (
                <div key={visitor._id} className="p-5 flex items-center gap-4 hover:bg-white/90 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/60 dark:to-pink-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 font-black text-lg uppercase shrink-0 shadow-inner">
                    {visitor.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{visitor.name}</p>
                    <p className="text-xs text-gray-500 truncate">{visitor.purpose}</p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-4">
                    <div className="text-sm text-gray-500 text-right">
                      <div className="font-medium text-green-600 dark:text-green-400">IN</div>
                      {format(new Date(visitor.entryTime), 'h:mm a')}
                    </div>
                    <button 
                      onClick={() => handleVisitorOut(visitor._id)}
                      className="text-xs bg-red-50 hover:bg-red-500 text-red-600 hover:text-white dark:bg-red-900/30 dark:hover:bg-red-600 dark:text-red-400 dark:hover:text-white px-3 py-1.5 rounded-lg font-bold transition-all border border-red-100 dark:border-red-800 shadow-sm"
                    >
                      Punch OUT
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Visitor Registration Modal */}
      {showVisitorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-2xl dark:bg-gray-800/90 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/50 dark:border-gray-700/50 transform scale-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Register Visitor</h3>
              <button onClick={() => setShowVisitorModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                ✕
              </button>
            </div>
            <form onSubmit={handleVisitorSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input required type="text" value={visitorForm.name} onChange={e => setVisitorForm({...visitorForm, name: e.target.value})} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input required type="text" value={visitorForm.phone} onChange={e => setVisitorForm({...visitorForm, phone: e.target.value})} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" placeholder="1234567890" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Purpose of Visit</label>
                <input required type="text" value={visitorForm.purpose} onChange={e => setVisitorForm({...visitorForm, purpose: e.target.value})} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" placeholder="Meeting / Guest Lecture" />
              </div>
              <button type="submit" className="w-full py-3.5 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Punch IN Visitor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;
