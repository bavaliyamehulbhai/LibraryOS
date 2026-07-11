import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const IssuedBooks = ({ books = [] }) => {
  const [localBooks, setLocalBooks] = useState(books);

  useEffect(() => {
    setLocalBooks(books);
  }, [books]);

  const handleRenew = async (transactionId, e) => {
    e.stopPropagation();
    try {
      const res = await api.put(`/v1/member-dashboard/renew/${transactionId}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Book renewed successfully!');
        setLocalBooks(prev => prev.map(tx => tx._id === transactionId ? res.data.data : tx));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to renew book.');
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/40 border border-gray-100 dark:border-gray-700/50 overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
        <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center tracking-tight">
          <span className="mr-3 text-2xl">📚</span> Current Issued Books
        </h3>
        <div className="flex items-center space-x-4">
          <Link to="/member/history" className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition">
            View History →
          </Link>
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
            {localBooks.length} Active
          </span>
        </div>
      </div>

      <div className="p-0">
        {localBooks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>You have no books currently issued.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {localBooks.map(transaction => {
              const book = transaction.bookId;
              const isOverdue = new Date() > new Date(transaction.dueDate);
              
              // Calculate days left
              const timeDiff = new Date(transaction.dueDate).getTime() - new Date().getTime();
              const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

              return (
                <div key={transaction._id} className="p-6 flex items-center hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition duration-300 group cursor-pointer">
                  <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md flex-shrink-0 mr-5 relative group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </div>
                    {book?.coverImage && (
                      <img 
                        src={book.coverImage} 
                        alt={book.title} 
                        className="w-full h-full object-cover relative z-10" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{book?.title || 'Unknown Book'}</h4>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate mb-1">By {book?.authors?.join(', ')}</p>
                    <div className="flex items-center text-xs space-x-4 text-gray-500 dark:text-gray-400 mt-2 font-medium">
                      <span><span className="opacity-70">Issued:</span> {new Date(transaction.issueDate).toLocaleDateString()}</span>
                      <span>Due: {new Date(transaction.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-4 flex flex-col items-end">
                    {isOverdue ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold uppercase tracking-wider mb-2 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                        Overdue ({Math.abs(daysLeft)} days)
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                        {daysLeft} Days Left
                      </span>
                    )}
                    <button 
                      onClick={(e) => handleRenew(transaction._id, e)}
                      disabled={isOverdue}
                      className={`mt-2 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border transition ${
                        isOverdue 
                          ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500' 
                          : 'border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      Renew Book
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuedBooks;
