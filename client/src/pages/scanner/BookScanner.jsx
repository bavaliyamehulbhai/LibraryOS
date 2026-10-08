import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Camera, Barcode, Sparkles, CheckCircle2, History, 
  BookOpen, ArrowRight, ShieldCheck, Search, RefreshCw 
} from 'lucide-react';

const BookScanner = () => {
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Setup Barcode Scanner with optimized configuration
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 180 },
        rememberLastUsedCamera: true
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        setIsbn(decodedText);
        scanner.clear();
        toast.success("Barcode recognized!");
        processISBN(decodedText);
      },
      (errorMessage) => {
        // Silently scan frames
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.error("Scanner cleanup notice", error);
      });
    };
  }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!isbn) return;
    processISBN(isbn.trim());
  };

  const processISBN = async (targetIsbn) => {
    setLoading(true);
    setScannedResult(null);
    try {
      const res = await api.post('/v1/scanner/isbn', { isbn: targetIsbn });
      if (res.data.success) {
        toast.success(res.data.message || "Book metadata extracted & registered!");
        setScannedResult(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to scan and parse book ISBN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Smart Catalog Scanner
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                AI ISBN Fetcher
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Point camera at book barcode or type ISBN to instantly enrich catalog records via Google Books
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/scanner/history')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-white/10 transition shadow-sm self-start sm:self-auto"
        >
          <History className="w-4 h-4 text-blue-500" />
          <span>Scan History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Camera Scanner & Manual Input */}
        <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Barcode className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Hardware Optical Sensor
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Camera Active
              </span>
            </div>

            {/* Video Viewport */}
            <div id="reader" className="w-full bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800 min-h-[280px]"></div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Manual ISBN Input
              </label>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input 
                    type="text" 
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="e.g. 9780132350884, 9780596517748"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner font-mono"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading || !isbn.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5 active:scale-95"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <span>Lookup</span>
                  )}
                </button>
              </form>
              <p className="text-[11px] text-slate-400 mt-2">
                Supports ISBN-10, ISBN-13, EAN-13, and Code-128 barcode standards.
              </p>
            </div>
          </div>
        </div>

        {/* Right: AI Extraction Results */}
        <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Extraction Preview
            </h2>
          </div>
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
              <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-medium animate-pulse">
                Querying Google Books & AI Metadata Engine...
              </p>
            </div>
          ) : scannedResult ? (
            <div className="flex-1 flex flex-col justify-between bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30 p-5 rounded-xl animate-in fade-in duration-300">
              <div>
                <div className="flex items-start gap-4 mb-4">
                  {scannedResult.coverImage ? (
                    <img 
                      src={scannedResult.coverImage} 
                      alt="Cover" 
                      className="w-20 h-28 object-cover rounded-lg shadow-md border border-white/20 flex-shrink-0" 
                    />
                  ) : (
                    <div className="w-20 h-28 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                      Successfully Registered
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1 line-clamp-2">
                      {scannedResult.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      By {scannedResult.author || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/50 dark:border-white/5">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ISBN</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{scannedResult.isbn}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Category</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {scannedResult.categories?.[0] || scannedResult.category || "General"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Publisher</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                      {scannedResult.publisher || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Copies Added</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {scannedResult.totalCopies || 1} Copy
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced to catalog
                </span>
                <Link 
                  to="/books" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <span>View in Catalog</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <Barcode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">
                Awaiting Optical Input
              </h3>
              <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                Scan any physical book barcode with your camera or enter the 10/13 digit ISBN to view auto-populated metadata.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BookScanner;
