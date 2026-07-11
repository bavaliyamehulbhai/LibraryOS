import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileBottomNav from "./MobileBottomNav";
import { FeatureProvider } from "../common/FeatureGuard";

const DashboardLayout = () => {
  return (
    <FeatureProvider>
      <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 relative z-0">
            <Outlet />
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </FeatureProvider>
  );
};

export default DashboardLayout;
