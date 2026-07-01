import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

import ProfileCard from '../../components/member-dashboard/ProfileCard';
import StatsCard from '../../components/member-dashboard/StatsCard';
import IssuedBooks from '../../components/member-dashboard/IssuedBooks';
import DigitalCardWidget from '../../components/member-dashboard/DigitalCardWidget';
import FinesWidget from '../../components/member-dashboard/FinesWidget';

const MemberDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/v1/member-dashboard');
        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error(error.response?.data?.message || 'Failed to load your dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8 text-center text-gray-500">
        Error loading dashboard data. Please try again.
      </div>
    );
  }

  const { profile, plan, card, stats, issuedBooks, pendingFines } = dashboardData;

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {profile?.name.split(' ')[0]}!</h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">Here is your library activity overview.</p>
        </div>

        {/* Top Grid: Profile & Digital Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProfileCard profile={profile} plan={plan} />
          </div>
          <div>
            <DigitalCardWidget card={card} profile={profile} />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatsCard title="Issued Books" value={stats.activeCheckouts} icon="📚" color="blue" />
          <StatsCard title="Reservations" value={stats.reservationsCount} icon="🔖" color="purple" />
          <StatsCard title="Pending Fines" value={`₹${stats.pendingFine}`} icon="💸" color="red" />
          <StatsCard title="Membership Status" value={profile.status} icon="✅" color="green" />
        </div>

        {/* Bottom Grid: Activity & Fines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <IssuedBooks books={issuedBooks} />
          </div>
          <div>
            <FinesWidget pendingAmount={stats.pendingFine} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberDashboard;
