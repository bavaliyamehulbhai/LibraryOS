import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

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
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">📖</span> My Borrow History
            </h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400">View all the books you've read in the past.</p>
          </div>
          <div className="mt-4 md:mt-0 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Books Read</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalBorrowed}</div>
          </div>
        </div>

        {/* History List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
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
                  <div key={transaction._id} className="p-6 flex flex-col md:flex-row md:items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden shadow-sm flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                      {book?.coverImage ? (
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        </div>
                      )}
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
