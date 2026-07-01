import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useScanBarcode } from "../../hooks/useBarcodes";
import toast from "react-hot-toast";
import { ArrowLeft, ScanBarcode, BookOpen, AlertCircle, CheckCircle, Clock } from "lucide-react";

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState("");
  const [action, setAction] = useState("VERIFY"); // VERIFY, ISSUE, RETURN
  const [result, setResult] = useState(null);
  
  const scanBarcodeApi = useScanBarcode();
  const inputRef = useRef(null);

  useEffect(() => {
    // Keep focus on input for physical barcode scanners
    inputRef.current?.focus();
  }, []);

  const handleScan = (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    scanBarcodeApi.mutate({ barcode: barcode.trim(), action }, {
      onSuccess: (res) => {
        setResult({ success: true, data: res.data });
        toast.success(`Barcode processed: ${res.data.copy.copyCode}`);
        setBarcode(""); // Clear for next scan
        inputRef.current?.focus();
      },
      onError: (err) => {
        setResult({ success: false, error: err.response?.data?.message || "Invalid barcode" });
        toast.error("Scan failed");
        setBarcode(""); // Clear to retry
        inputRef.current?.focus();
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/barcodes" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Barcode Scanner</h1>
          <p className="text-gray-600 mt-1">Use a physical scanner or type the barcode code manually.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Scan Mode</h3>
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
              <button onClick={() => setAction("VERIFY")} className={`flex-1 py-2 text-sm font-medium rounded-md ${action === "VERIFY" ? "bg-white shadow text-blue-600" : "text-gray-500"}`}>Verify / Audit</button>
              <button onClick={() => setAction("ISSUE")} className={`flex-1 py-2 text-sm font-medium rounded-md ${action === "ISSUE" ? "bg-white shadow text-purple-600" : "text-gray-500"}`}>Issue Book</button>
              <button onClick={() => setAction("RETURN")} className={`flex-1 py-2 text-sm font-medium rounded-md ${action === "RETURN" ? "bg-white shadow text-green-600" : "text-gray-500"}`}>Return Book</button>
            </div>

            <form onSubmit={handleScan}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scan Barcode</label>
              <div className="relative">
                <input 
                  ref={inputRef}
                  type="text" 
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 text-lg font-mono uppercase"
                  placeholder="Scan or type BOOK-000001..."
                  autoFocus
                />
                <ScanBarcode className="absolute left-3 top-4.5 text-gray-400" size={24} />
              </div>
              <button type="submit" disabled={scanBarcodeApi.isLoading || !barcode} className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                {scanBarcodeApi.isLoading ? "Processing..." : `Process ${action}`}
              </button>
            </form>
          </div>
        </div>

        <div>
          {result && (
            <div className={`p-6 rounded-lg shadow-sm border ${result.success ? 'bg-white border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Scan Result</h3>
              
              {!result.success ? (
                <div className="flex flex-col items-center text-center py-6 text-red-600">
                  <AlertCircle size={48} className="mb-4 text-red-500" />
                  <p className="font-bold text-lg">{result.error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-600 mb-4 bg-green-50 p-3 rounded text-sm font-medium">
                    <CheckCircle size={20} /> Action '{action}' Successful
                  </div>
                  
                  <div className="flex items-start gap-4">
                    {result.data.book?.coverImage ? (
                      <img src={result.data.book.coverImage} className="w-20 rounded shadow" alt="cover" />
                    ) : (
                      <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center text-gray-400"><BookOpen /></div>
                    )}
                    <div>
                      <h4 className="font-bold text-lg leading-tight">{result.data.book?.title}</h4>
                      <p className="text-gray-500 text-sm font-mono mt-1">{result.data.book?.isbn}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono font-semibold border">{result.data.copy?.copyCode}</span>
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{result.data.copy?.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!result && (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <ScanBarcode size={48} className="mb-4 opacity-50" />
              <p>Waiting for scanner input...</p>
              <p className="text-sm mt-2">Ensure focus is on the input field when using a physical scanner.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
