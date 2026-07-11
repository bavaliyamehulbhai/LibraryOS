import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import MobileBottomNav from '../components/layout/MobileBottomNav';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative print:h-auto print:overflow-visible print:block">
      <div className="print:hidden"><Sidebar /></div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative print:overflow-visible print:block">
        <div className="print:hidden"><Navbar /></div>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 pb-24 md:pb-6 print:overflow-visible print:bg-white print:p-0 relative z-0">
          <Outlet />
        </main>
      </div>
      <div className="print:hidden"><MobileBottomNav /></div>
    </div>
  );
};

export default DashboardLayout;
