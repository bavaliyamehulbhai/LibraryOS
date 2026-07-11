import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ImageWithFallback = ({ src, alt, className, iconSize = "w-6 h-6" }) => {
  const [error, setError] = useState(false);
  
  if (!src || error) {
    return (
      <div className={`w-full h-full flex items-center justify-center text-gray-400 bg-gray-200 dark:bg-gray-700`}>
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
      </div>
    );
  }
  
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

const MemberHistory = () => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/v1/member-dashboard/stats');
        if (res.data.success) {
          setHistoryData(res.data.data);
        }
      } catch (error) {
        console.error("History error:", error);
        toast.error(error.response?.data?.message || 'Failed to load your borrow history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!historyData) {
    return (
      <div className="p-8 text-center text-gray-500">
        Error loading history. Please try again.
      </div>
    );
  }

  const { totalBorrowed, history } = historyData;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">📖</span> My Borrow History
            </h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400">View all the books you've read in the past.</p>
          </div>
          <div className="mt-4 md:mt-0 bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 p-5 rounded-3xl shadow-lg shadow-blue-500/10 dark:shadow-black/40 border border-white/50 dark:border-gray-700/50 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/20 blur-xl rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 relative z-10">Total Books Read</div>
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 relative z-10 tracking-tight">{totalBorrowed}</div>
          </div>
        </div>

        {/* History List */}
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/40 border border-white/50 dark:border-gray-700/50 overflow-hidden">
          {history.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No reading history yet</h3>
              <p>You haven't completed any book checkouts yet. Start reading today!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {history.map(transaction => {
                const book = transaction.bookId;
                return (
                  <div key={transaction._id} className="p-6 flex flex-col md:flex-row md:items-center hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-300 group">
                    <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm flex-shrink-0 mb-4 md:mb-0 md:mr-6 group-hover:shadow-md transition-shadow">
                      <ImageWithFallback src={book?.coverImage} alt={book?.title} className="w-full h-full object-cover" iconSize="w-8 h-8" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">{book?.title || 'Unknown Book'}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">By {book?.authors?.join(', ') || 'Unknown Author'}</p>
                      
                      <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <span className="mr-1">📤</span>
                          Issued: {new Date(transaction.issueDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <span className="mr-1">📥</span>
                          Returned: {new Date(transaction.returnDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MemberHistory;
