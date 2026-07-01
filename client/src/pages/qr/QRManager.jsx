import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCopies } from "../../hooks/useCopies";
import { useGenerateBulkQR, useGenerateSingleQR } from "../../hooks/useQR";
import toast from "react-hot-toast";
import { QrCode, Search, CheckSquare, Square, Download, Printer } from "lucide-react";

const QRManager = () => {
  const { data: copiesData, isLoading } = useCopies();
  const generateBulk = useGenerateBulkQR();
  const generateSingle = useGenerateSingleQR();

  const [search, setSearch] = useState("");
  const copies = copiesData?.data || [];
  
  const filteredCopies = copies.filter(c => 
    c.copyCode.toLowerCase().includes(search.toLowerCase()) || 
    c.bookId?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerateSingle = (copyCode) => {
    generateSingle.mutate({ copyCode }, {
      onSuccess: () => toast.success("QR Code Generated"),
      onError: (err) => toast.error(err.response?.data?.message || "Failed to generate QR")
    });
  };

  const handleGenerateBulk = (bookId) => {
    if (!bookId) return;
    generateBulk.mutate({ bookId }, {
      onSuccess: () => toast.success("Bulk QR Codes Generated"),
      onError: (err) => toast.error("Failed to generate bulk QRs")
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">QR Code Manager</h1>
          <p className="text-gray-600 mt-1">Generate and manage Smart QR Codes for physical book copies.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/qr/scanner" className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-50 transition">Scanner</Link>
          <Link to="/qr/analytics" className="bg-white border border-purple-600 text-purple-600 px-4 py-2 rounded font-medium hover:bg-purple-50 transition">Analytics</Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="relative w-full md:w-96 mb-6">
          <input
            type="text"
            placeholder="Search copies by code or title..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        <div className="border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading inventory...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Copy Code</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Book</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">QR Status</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCopies.map(copy => (
                    <tr key={copy._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-mono font-bold text-gray-800">{copy.copyCode}</td>
                      <td className="px-4 py-4 text-gray-600 max-w-xs truncate">{copy.bookId?.title}</td>
                      <td className="px-4 py-4 text-center">
                        {copy.qrCode ? (
                          <div className="flex justify-center">
                            <img src={copy.qrCode} alt="QR" className="w-10 h-10 border p-0.5 rounded" />
                          </div>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-800 rounded">Missing</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {!copy.qrCode ? (
                          <button onClick={() => handleGenerateSingle(copy.copyCode)} disabled={generateSingle.isLoading} className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded bg-blue-50 transition text-xs">
                            Generate QR
                          </button>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleGenerateBulk(copy.bookId._id)} title="Generate for all copies of this book" className="text-purple-600 hover:text-purple-800 font-medium px-2 py-1.5 rounded bg-purple-50 transition text-xs flex items-center gap-1">
                              <QrCode size={14}/> Bulk
                            </button>
                            <a href={copy.qrCode} download={`QR_${copy.copyCode}.png`} className="text-gray-600 hover:text-gray-900 font-medium px-2 py-1.5 rounded bg-gray-100 transition text-xs flex items-center gap-1">
                              <Download size={14} /> PNG
                            </a>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredCopies.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500">No copies found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRManager;
