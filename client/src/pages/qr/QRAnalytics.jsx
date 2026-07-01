import React from "react";
import { Link } from "react-router-dom";
import { useQRStats } from "../../hooks/useQR";
import { ArrowLeft, Activity, QrCode, TrendingUp } from "lucide-react";

const QRAnalytics = () => {
  const { data: statsData, isLoading } = useQRStats();
  const stats = statsData?.data || { totalQRs: 0, scansToday: 0, totalScans: 0 };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6 border-b pb-4">
        <Link to="/qr" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">QR Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Metrics and usage logs for Smart Library QR codes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-full"><QrCode size={32} /></div>
          <div>
            <h3 className="text-gray-500 font-medium">Active QR Codes</h3>
            <p className="text-3xl font-bold text-gray-900">{isLoading ? "-" : stats.totalQRs}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full"><Activity size={32} /></div>
          <div>
            <h3 className="text-gray-500 font-medium">Scans Today</h3>
            <p className="text-3xl font-bold text-gray-900">{isLoading ? "-" : stats.scansToday}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-full"><TrendingUp size={32} /></div>
          <div>
            <h3 className="text-gray-500 font-medium">Lifetime Scans</h3>
            <p className="text-3xl font-bold text-gray-900">{isLoading ? "-" : stats.totalScans}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-500">
        <Activity size={48} className="mx-auto mb-4 opacity-50 text-gray-400" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">Scan Logging Architecture</h3>
        <p className="max-w-xl mx-auto">
          Every time a user scans a Smart QR code using their mobile device or a librarian scans it via the portal, an immutable <strong>QRScanLog</strong> is created. This allows LibraryOS to track the most popular books, the exact time of scans, and the geographical engagement level across the library floor.
        </p>
      </div>
    </div>
  );
};

export default QRAnalytics;
