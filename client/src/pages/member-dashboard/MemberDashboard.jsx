import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { RefreshCw, BookOpen, AlertCircle } from 'lucide-react';

import ProfileCard from '../../components/member-dashboard/ProfileCard';
import StatsCard from '../../components/member-dashboard/StatsCard';
import IssuedBooks from '../../components/member-dashboard/IssuedBooks';
import DigitalCardWidget from '../../components/member-dashboard/DigitalCardWidget';
import FinesWidget from '../../components/member-dashboard/FinesWidget';

const MemberDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/member-dashboard');
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error(error.response?.data?.message || 'Failed to load member dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-400 text-sm font-medium">Loading your patron profile & loans...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Unable to Load Member Profile</h3>
        <p className="text-slate-500 text-xs mt-1 mb-6">
          We could not locate an active patron record associated with your account.
        </p>
        <button
          onClick={fetchDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  const { profile = {}, plan = null, card = null, stats = {}, issuedBooks = [], pendingFines = [] } = dashboardData;
  const firstName = (profile?.name || "Member").trim().split(' ')[0] || "Member";

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Self-Service Patron Portal
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome, {firstName}!
            </h1>
            <p className="text-gray-500 mt-1 text-sm dark:text-gray-400">
              Here is your live library activity, active checkouts, and digital membership credential.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 transition shadow-2xs"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Top Grid: Profile & Digital Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProfileCard profile={profile} plan={plan} />
          </div>
          <div>
            <DigitalCardWidget card={card} profile={profile} plan={plan} />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatsCard title="Issued Books" value={stats?.activeCheckouts ?? 0} icon="📚" color="blue" />
          <StatsCard title="Reservations" value={stats?.reservationsCount ?? 0} icon="🔖" color="purple" />
          <StatsCard title="Pending Fines" value={`₹${stats?.pendingFine ?? 0}`} icon="💸" color="red" />
          <StatsCard title="Membership Status" value={profile?.status || "ACTIVE"} icon="✅" color="green" />
        </div>

        {/* Bottom Grid: Activity & Fines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <IssuedBooks books={issuedBooks} />
          </div>
          <div>
            <FinesWidget pendingAmount={stats?.pendingFine ?? 0} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberDashboard;
