import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Building2, CheckCircle2, ArrowRight, Clock, 
  ShieldCheck, Maximize2, Minimize2, ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AttendanceKiosk = () => {
  const [memberId, setMemberId] = useState('');
  const [loading, setLoading] = useState(false);
  const [punchResult, setPunchResult] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keep focus on the input for hardware barcode guns
  useEffect(() => {
    const focusInterval = setInterval(() => {
      if (inputRef.current && !loading && !punchResult) {
        inputRef.current.focus();
      }
    }, 1000);
    return () => clearInterval(focusInterval);
  }, [loading, punchResult]);

  const handlePunch = async (e) => {
    e.preventDefault();
    if (!memberId.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/v1/attendance/punch', { memberId: memberId.trim() });
      if (res.data.success) {
        setPunchResult(res.data);
        // Clear result after 3 seconds
        setTimeout(() => {
          setPunchResult(null);
          setMemberId('');
        }, 3200);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Access verification failed');
      setMemberId('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-white p-6 sm:p-10 select-none relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Top Bar */}
      <div className="flex items-center justify-between z-10">
        <button 
          onClick={() => navigate('/attendance')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Kiosk</span>
        </button>

        <div className="text-center font-mono">
          <div className="text-2xl sm:text-3xl font-bold tracking-wider text-slate-100">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-xs text-slate-400">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        <button 
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 backdrop-blur-md transition"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Terminal Center */}
      <div className="max-w-xl w-full mx-auto text-center z-10 my-auto py-8">
        
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
          <Building2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
          Turnstile Terminal
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mb-8 max-w-sm mx-auto">
          Scan your patron barcode card or tap your credentials below
        </p>

        {punchResult ? (
          <div className={`p-8 rounded-3xl border backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-200 ${
            punchResult.action === 'IN' 
              ? 'bg-emerald-950/40 border-emerald-500/40 shadow-emerald-500/20 text-emerald-300' 
              : 'bg-blue-950/40 border-blue-500/40 shadow-blue-500/20 text-blue-300'
          }`}>
            <div className="text-5xl mb-3">
              {punchResult.action === 'IN' ? '👋' : '✌️'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">
              {punchResult.message || (punchResult.action === 'IN' ? 'Welcome Inside!' : 'Goodbye!')}
            </h2>
            <p className="text-sm font-medium opacity-90">
              {punchResult.action === 'IN' 
                ? 'Access granted. Your entry has been recorded.' 
                : `Checked out successfully. Session: ${punchResult.durationMinutes || 0} minutes.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handlePunch} className="max-w-md mx-auto">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                disabled={loading}
                placeholder="Ready for scan..."
                className="w-full text-center text-xl sm:text-2xl font-mono py-4 px-6 bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-white placeholder-slate-500"
                autoFocus
              />
              {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Optical barcode listener active • Auto-submit enabled</span>
            </div>
          </form>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 z-10 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>LibraryOS Telemetry Engine v2.0 • Zero Touch Check-in</span>
        </div>
        <div className="text-[11px] text-slate-600">
          Press Esc to exit fullscreen
        </div>
      </div>
    </div>
  );
};

export default AttendanceKiosk;
