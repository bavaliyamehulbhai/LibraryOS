import React from 'react';
import { Link } from 'react-router-dom';

const IssuedBooks = ({ books = [] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-full">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">📚</span> Current Issued Books
        </h3>
        <div className="flex items-center space-x-4">
          <Link to="/member/history" className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 transition">
            View History →
          </Link>
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
            {books.length} Active
          </span>
        </div>
      </div>

      <div className="p-0">
        {books.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>You have no books currently issued.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {books.map(transaction => {
              const book = transaction.bookId;
              const isOverdue = new Date() > new Date(transaction.dueDate);
              
              // Calculate days left
              const timeDiff = new Date(transaction.dueDate).getTime() - new Date().getTime();
              const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

              return (
                <div key={transaction._id} className="p-5 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden shadow-sm flex-shrink-0 mr-4">
                    {book?.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{book?.title || 'Unknown Book'}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-1">Author: {book?.authors?.join(', ')}</p>
                    <div className="flex items-center text-xs space-x-4 text-gray-500 dark:text-gray-400">
                      <span>Issued: {new Date(transaction.issueDate).toLocaleDateString()}</span>
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
                    {/* Placeholder for Renew button logic phase 8 */}
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
