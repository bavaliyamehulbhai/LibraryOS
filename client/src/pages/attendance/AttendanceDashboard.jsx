import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  Users, UserCheck, ShieldCheck, LogIn, LogOut, 
  ExternalLink, UserPlus, Clock, Radio, Search
} from 'lucide-react';

const AttendanceDashboard = () => {
  const [activeData, setActiveData] = useState({ members: [], visitors: [], totalActive: 0 });
  const [loading, setLoading] = useState(true);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const navigate = useNavigate();
  
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
    const interval = setInterval(fetchActive, 8000); // 8s auto-telemetry polling
    return () => clearInterval(interval);
  }, []);

  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/v1/attendance/visitor', visitorForm);
      if (res.data.success) {
        toast.success(res.data.message || 'Visitor logged in successfully');
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
        toast.success(res.data.message || 'Visitor punched out');
        fetchActive();
      }
    } catch (error) {
      toast.error('Failed to punch out visitor');
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600/20 border-t-blue-600 mb-3"></div>
        <p className="text-xs text-slate-400">Connecting to attendance sensors...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Live Attendance & Turnstile
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Telemetry Live
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time campus occupancy tracker, gate telemetry, and guest log
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button 
            onClick={() => navigate('/attendance/kiosk')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-white/10 transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
            <span>Launch Kiosk Mode</span>
          </button>

          <button 
            onClick={() => setShowVisitorModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Visitor</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Occupancy</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
            {activeData.totalActive || 0}
            <span className="text-xs font-normal text-slate-400">Patrons Inside</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Within building safety capacity</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Active Students / Members</div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
            {activeData.members?.length || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Authenticated ID badge holders</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Registered Guests / Visitors</div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
            {activeData.visitors?.length || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Signed-in guest badges</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Gate Telemetry</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Turnstiles Normal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Continuous heartbeat 8s sync</p>
        </div>
      </div>

      {/* Columns: Members & Visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Members Column */}
        <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Inside Members Roster
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              {activeData.members?.length || 0} Active
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[500px] overflow-y-auto">
            {activeData.members?.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No members currently inside the premises.
              </div>
            ) : (
              activeData.members.map(log => (
                <div key={log._id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {log.user?.firstName?.[0] || 'M'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {log.user?.firstName} {log.user?.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{log.user?.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      <LogIn className="w-3 h-3" />
                      IN
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {format(new Date(log.entryTime), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Visitors Column */}
        <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Inside Guest Visitors
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
              {activeData.visitors?.length || 0} Guests
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[500px] overflow-y-auto">
            {activeData.visitors?.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No external visitors currently logged inside.
              </div>
            ) : (
              activeData.visitors.map(visitor => (
                <div key={visitor._id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {visitor.name?.[0] || 'V'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{visitor.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{visitor.purpose || 'General Visit'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">
                        <LogIn className="w-3 h-3" />
                        IN
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {format(new Date(visitor.entryTime), 'h:mm a')}
                      </p>
                    </div>

                    <button 
                      onClick={() => handleVisitorOut(visitor._id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white dark:bg-rose-950/30 dark:hover:bg-rose-600 dark:text-rose-400 transition"
                      title="Punch Out Visitor"
                    >
                      Exit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Visitor Modal */}
      {showVisitorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 dark:border-white/10">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-500" />
                <span>Register Guest Visitor</span>
              </h3>
              <button 
                onClick={() => setShowVisitorModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleVisitorSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input 
                  required 
                  type="text" 
                  value={visitorForm.name} 
                  onChange={e => setVisitorForm({...visitorForm, name: e.target.value})} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                  placeholder="e.g. Dr. Rajesh Kumar" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input 
                  required 
                  type="text" 
                  value={visitorForm.phone} 
                  onChange={e => setVisitorForm({...visitorForm, phone: e.target.value})} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                  placeholder="e.g. +91 9876543210" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Purpose of Visit</label>
                <input 
                  required 
                  type="text" 
                  value={visitorForm.purpose} 
                  onChange={e => setVisitorForm({...visitorForm, purpose: e.target.value})} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                  placeholder="e.g. Research / Guest Seminar / Admissions" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Log Visitor IN
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;
