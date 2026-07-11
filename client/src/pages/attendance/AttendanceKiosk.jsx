import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AttendanceKiosk = () => {
  const [memberId, setMemberId] = useState('');
  const [loading, setLoading] = useState(false);
  const [punchResult, setPunchResult] = useState(null);
  const inputRef = useRef(null);

  // Keep focus on the input for barcode scanners
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
        }, 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to punch in/out');
      setMemberId('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        <div className="space-y-4">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">
            🏛️
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Library Attendance Kiosk
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400">
            Please scan your ID card or enter your Member ID below
          </p>
        </div>

        {punchResult ? (
          <div className={`p-10 rounded-3xl animate-fade-in-up border backdrop-blur-xl shadow-2xl ${
            punchResult.action === 'IN' 
              ? 'bg-green-50/80 border-green-200 dark:bg-green-900/30 dark:border-green-500/30 shadow-green-500/20' 
              : 'bg-blue-50/80 border-blue-200 dark:bg-blue-900/30 dark:border-blue-500/30 shadow-blue-500/20'
          }`}>
            <div className={`text-6xl mb-6 ${punchResult.action === 'IN' ? 'text-green-500' : 'text-blue-500'}`}>
              {punchResult.action === 'IN' ? '👋' : '✌️'}
            </div>
            <h2 className={`text-3xl font-black mb-2 ${
              punchResult.action === 'IN' ? 'text-green-800 dark:text-green-400' : 'text-blue-800 dark:text-blue-400'
            }`}>
              {punchResult.message}
            </h2>
            <p className={`text-lg font-medium ${
              punchResult.action === 'IN' ? 'text-green-600 dark:text-green-500' : 'text-blue-600 dark:text-blue-500'
            }`}>
              {punchResult.action === 'IN' 
                ? 'Your entry has been recorded.' 
                : `Total duration: ${punchResult.durationMinutes} minutes.`}
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
                placeholder="Scan ID or enter manually..."
                className="w-full text-center text-2xl py-6 px-6 bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)] dark:shadow-[0_0_40px_-10px_rgba(59,130,246,0.15)] focus:border-blue-500/50 dark:focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all dark:text-white placeholder-gray-400 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]"
                autoFocus
              />
              {loading && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AttendanceKiosk;
