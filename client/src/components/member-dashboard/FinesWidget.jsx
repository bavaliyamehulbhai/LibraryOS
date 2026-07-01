import React from 'react';
import { Link } from 'react-router-dom';

const FinesWidget = ({ pendingAmount = 0 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">💸</span> Fine Overview
        </h3>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
        {pendingAmount > 0 ? (
          <>
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 dark:bg-red-900/30 dark:text-red-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h4 className="text-gray-500 font-medium mb-1 dark:text-gray-400">Total Pending Fines</h4>
            <p className="text-4xl font-bold text-red-600 dark:text-red-400 mb-6">₹{pendingAmount}</p>
            <button className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition w-full shadow-sm">
              Pay Now
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 dark:bg-green-900/30 dark:text-green-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All Clear!</h4>
            <p className="text-gray-500 dark:text-gray-400">You have no pending fines at the moment.</p>
          </>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center">
        <Link to="/member/fines" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium text-sm transition">
          View Fine History
        </Link>
      </div>
    </div>
  );
};

export default FinesWidget;
