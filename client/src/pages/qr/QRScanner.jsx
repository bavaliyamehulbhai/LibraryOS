import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useScanQR } from "../../hooks/useQR";
import toast from "react-hot-toast";
import { ArrowLeft, QrCode, BookOpen, MapPin, Tag, CheckCircle, AlertCircle } from "lucide-react";

const QRScanner = () => {
  const [qrCode, setQrCode] = useState("");
  const [result, setResult] = useState(null);
  
  const scanQRApi = useScanQR();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = (e) => {
    e.preventDefault();
    if (!qrCode.trim()) return;

    // Simulate scanning logic depending on if payload is JSON or direct string
    // Here we'll assume the scanner might input JSON string or a URL.
    // We just extract copyCode if it's JSON or if they just typed the copyCode.
    let codeToProcess = qrCode.trim();
    try {
      const parsed = JSON.parse(codeToProcess);
      if (parsed.copyCode) codeToProcess = parsed.copyCode;
    } catch(e) {
      // If it's a URL, extract the ID or just assume they typed the copyCode directly
    }

    scanQRApi.mutate({ copyCode: codeToProcess, device: "Admin Portal Scanner" }, {
      onSuccess: (res) => {
        setResult({ success: true, data: res.data });
        toast.success(`QR Smart Lookup Successful`);
        setQrCode("");
        inputRef.current?.focus();
      },
      onError: (err) => {
        setResult({ success: false, error: err.response?.data?.message || "Invalid QR Code" });
        toast.error("Scan failed");
        setQrCode("");
        inputRef.current?.focus();
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/qr" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Smart QR Scanner</h1>
          <p className="text-gray-600 mt-1">Scan a book's QR code to instantly pull its entire context.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Scan Input</h3>

            <form onSubmit={handleScan}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scan QR Payload</label>
              <div className="relative">
                <input 
                  ref={inputRef}
                  type="text" 
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-50 font-mono text-sm"
                  placeholder="Scan QR code here..."
                  autoFocus
                />
                <QrCode className="absolute left-3 top-4.5 text-gray-400" size={24} />
              </div>
              <button type="submit" disabled={scanQRApi.isLoading || !qrCode} className="w-full mt-4 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition">
                {scanQRApi.isLoading ? "Looking up..." : `Process Smart Lookup`}
              </button>
            </form>
          </div>
        </div>

        <div>
          {result && (
            <div className={`p-6 rounded-lg shadow-sm border ${result.success ? 'bg-white border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Smart Context</h3>
              
              {!result.success ? (
                <div className="flex flex-col items-center text-center py-6 text-red-600">
                  <AlertCircle size={48} className="mb-4 text-red-500" />
                  <p className="font-bold text-lg">{result.error}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-green-600 mb-2 bg-green-50 p-2 rounded text-sm font-medium">
                    <CheckCircle size={18} /> Context Retrieved Successfully
                  </div>
                  
                  <div className="flex items-start gap-4">
                    {result.data.book?.coverImage ? (
                      <img src={result.data.book.coverImage} className="w-16 rounded shadow object-cover" alt="cover" />
                    ) : (
                      <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-400"><BookOpen /></div>
                    )}
                    <div>
                      <h4 className="font-bold text-lg leading-tight mb-1">{result.data.book?.title}</h4>
                      <p className="text-gray-500 text-sm mb-2">{result.data.book?.author?.name || "Author"}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono font-bold border"><Tag size={12} className="inline mr-1" />{result.data.copy?.copyCode}</span>
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{result.data.copy?.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shelf Location</h5>
                    {result.data.location ? (
                      <div className="flex items-start gap-3">
                        <MapPin className="text-blue-500 shrink-0" size={18} />
                        <div>
                          <p className="text-sm text-gray-800 font-medium">{result.data.location.floor} &rarr; {result.data.location.section}</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">Rack {result.data.location.rack}, Shelf {result.data.location.shelf}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No physical location mapped.</span>
                    )}
                  </div>
                  
                  <Link to={`/copies/${result.data.copy?._id}`} className="block text-center w-full bg-gray-100 text-gray-700 font-medium py-2 rounded hover:bg-gray-200 transition">
                    Open Copy Operational Terminal
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {!result && (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <QrCode size={48} className="mb-4 opacity-50" />
              <p>Waiting for QR scanner...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
