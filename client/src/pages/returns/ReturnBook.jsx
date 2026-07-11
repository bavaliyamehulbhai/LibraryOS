import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReturnBook = () => {
  const navigate = useNavigate();
  const [copyBarcode, setCopyBarcode] = useState('');
  const [condition, setCondition] = useState('GOOD');
  
  const [returnLoading, setReturnLoading] = useState(false);

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!copyBarcode) {
      toast.error("Please scan a book copy barcode.");
      return;
    }
    
    setReturnLoading(true);
    try {
      const res = await api.post('/v1/returns', {
        copyBarcode,
        condition
      });
      
      if (res.data.success) {
        toast.success("Book returned successfully!");
        setCopyBarcode('');
        setCondition('GOOD');
        
        // Let's ask if they want to print the receipt or view details
        navigate(`/returns/${res.data.data._id}`); 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to return book');
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">📥</span> Return Book
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Scan book barcode to automatically calculate fines and process returns.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50 p-8">
          <form onSubmit={handleReturn}>
            
            <div className="mb-8 border-b pb-8 dark:border-gray-700">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                1. Scan Book Barcode
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Scan or type barcode here..." 
                  value={copyBarcode}
                  onChange={(e) => setCopyBarcode(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border border-white/50 dark:border-gray-700/50 rounded-2xl bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono tracking-widest shadow-inner transition-all hover:shadow-md"
                  required
                  autoFocus
                />
                <span className="absolute left-4 top-4 text-2xl">
                  {/* barcode icon */}
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                The system will automatically link the book to the member who issued it.
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                2. Return Condition
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className={`cursor-pointer border rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 ${condition === 'GOOD' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 shadow-lg shadow-green-500/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 hover:shadow-md'}`}>
                  <input type="radio" name="condition" value="GOOD" checked={condition === 'GOOD'} onChange={(e) => setCondition(e.target.value)} className="hidden" />
                  <span className="text-3xl mb-2">👍</span>
                  <span className="font-bold">Good Condition</span>
                </label>

                <label className={`cursor-pointer border rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 ${condition === 'DAMAGED' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 shadow-lg shadow-yellow-500/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 hover:shadow-md'}`}>
                  <input type="radio" name="condition" value="DAMAGED" checked={condition === 'DAMAGED'} onChange={(e) => setCondition(e.target.value)} className="hidden" />
                  <span className="text-3xl mb-2">🤕</span>
                  <span className="font-bold">Damaged</span>
                  <span className="text-xs mt-1">Applies ₹200 Penalty</span>
                </label>

                <label className={`cursor-pointer border rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 ${condition === 'LOST' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 shadow-lg shadow-red-500/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 hover:shadow-md'}`}>
                  <input type="radio" name="condition" value="LOST" checked={condition === 'LOST'} onChange={(e) => setCondition(e.target.value)} className="hidden" />
                  <span className="text-3xl mb-2">❓</span>
                  <span className="font-bold">Lost Book</span>
                  <span className="text-xs mt-1">Applies Price + ₹100</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={returnLoading || !copyBarcode}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:grayscale shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center"
              >
                {returnLoading ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div> Processing Return...</>
                ) : (
                  <>Complete Return ➔</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ReturnBook;
