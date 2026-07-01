import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const BookScanner = () => {
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Setup Barcode Scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: {width: 250, height: 250} },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        setIsbn(decodedText);
        scanner.clear();
        toast.success("Barcode scanned successfully!");
      },
      (errorMessage) => {
        // Log quietly or ignore
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear scanner", error);
      });
    };
  }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!isbn) return;
    processISBN(isbn);
  };

  const processISBN = async (targetIsbn) => {
    setLoading(true);
    setScannedResult(null);
    try {
      const res = await api.post('/v1/scanner/isbn', { isbn: targetIsbn });
      if (res.data.success) {
        toast.success(res.data.message);
        setScannedResult(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to scan and create book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3 text-4xl">📸</span> Smart Book Scanner
          </h1>
          <p className="text-gray-500 mt-2">Scan barcodes or enter ISBNs to automatically fetch metadata and create books.</p>
        </div>
        <button 
          onClick={() => navigate('/scanner/history')}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          View Scan History
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Scanner Panel */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Camera Scanner</h2>
          <div id="reader" className="w-full bg-black rounded-xl overflow-hidden shadow-inner min-h-[300px]"></div>
          
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Manual ISBN Entry</h2>
            <form onSubmit={handleManualSubmit} className="flex gap-3">
              <input 
                type="text" 
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="e.g. 9780132350884"
                className="flex-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                type="submit"
                disabled={loading || !isbn}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center"
              >
                {loading ? 'Processing...' : 'Process'}
              </button>
            </form>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Extraction Results</h2>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 animate-pulse">Contacting Google Books & Grok AI...</p>
            </div>
          ) : scannedResult ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-xl relative overflow-hidden">
              <div className="absolute top-2 right-2 text-green-500 opacity-20 text-6xl">✓</div>
              <h3 className="font-bold text-xl text-green-800 dark:text-green-400 mb-2">{scannedResult.title}</h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">By {scannedResult.author}</p>
              
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>ISBN:</strong> {scannedResult.isbn}</p>
                <p><strong>Category:</strong> {scannedResult.categories?.[0]}</p>
                <p><strong>Publisher:</strong> {scannedResult.publisher}</p>
                <p><strong>Total Copies:</strong> {scannedResult.totalCopies}</p>
              </div>

              {scannedResult.coverImage && (
                <div className="mt-4">
                  <img src={scannedResult.coverImage} alt="Cover" className="h-32 rounded shadow-md" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500 text-center">
              <div className="text-6xl mb-4">📖</div>
              <p>Scan a book barcode to automatically extract metadata and add it to your library inventory.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BookScanner;
