import React from "react";
import { Link } from "react-router-dom";
import { useBarcodeStats } from "../../hooks/useBarcodes";
import { Barcode, Printer, ScanLine } from "lucide-react";

const Barcodes = () => {
  const { data: statsData, isLoading } = useBarcodeStats();
  const stats = statsData?.data || { totalBarcodes: 0, scansToday: 0 };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Barcode Management System</h1>
          <p className="text-gray-600 mt-1">Manage, print, and scan barcodes for all physical library resources.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full"><Barcode size={32} /></div>
          <div>
            <h3 className="text-gray-500 font-medium">Total Barcodes Generated</h3>
            <p className="text-3xl font-bold text-gray-900">{isLoading ? "-" : stats.totalBarcodes}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-full"><ScanLine size={32} /></div>
          <div>
            <h3 className="text-gray-500 font-medium">Scans Today</h3>
            <p className="text-3xl font-bold text-gray-900">{isLoading ? "-" : stats.scansToday}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/barcodes/scanner" className="group bg-white p-8 rounded-lg shadow-sm border hover:border-blue-500 hover:shadow-md transition text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition">
            <ScanLine size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Live Barcode Scanner</h2>
          <p className="text-gray-500 text-sm">Scan a barcode using your device to instantly find, issue, or return a book copy.</p>
        </Link>

        <Link to="/barcodes/print" className="group bg-white p-8 rounded-lg shadow-sm border hover:border-purple-500 hover:shadow-md transition text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition">
            <Printer size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Print Labels</h2>
          <p className="text-gray-500 text-sm">Generate and print barcode labels for individual copies or entire book catalogs.</p>
        </Link>
      </div>
    </div>
  );
};

export default Barcodes;
