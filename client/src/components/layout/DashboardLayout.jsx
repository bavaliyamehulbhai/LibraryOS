import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { FeatureProvider } from "../common/FeatureGuard";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";

const DashboardLayout = () => {
  return (
    <FeatureProvider>
      <div className="app" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <div className="content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              <Bell className="w-5 h-5" />
            </Link>
          </div>
          <main style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
            <Outlet />
          </main>
        </div>
      </div>
    </FeatureProvider>
  );
};

export default DashboardLayout;
