import React from 'react';
import { Link } from 'react-router-dom';

const FinesWidget = ({ pendingAmount = 0 }) => {
  return (
    <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/40 border border-gray-100 dark:border-gray-700/50 overflow-hidden h-full flex flex-col group">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center relative z-10">
        <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center tracking-tight">
          <span className="mr-3 text-2xl">💸</span> Fine Overview
        </h3>
      </div>

      <div className="p-8 flex-1 flex flex-col justify-center items-center text-center relative z-10">
        {pendingAmount > 0 ? (
          <>
            <div className="absolute inset-0 bg-red-500/5 blur-3xl rounded-full -z-10 group-hover:bg-red-500/10 transition-colors"></div>
            <div className="w-24 h-24 bg-red-50 border border-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-inner dark:bg-red-900/30 dark:border-red-500/20 dark:text-red-400 group-hover:scale-110 transition-transform duration-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h4 className="text-[11px] uppercase tracking-widest font-black text-gray-400 mb-2">Total Pending Fines</h4>
            <p className="text-5xl font-black text-red-600 dark:text-red-400 mb-8 tracking-tighter">₹{pendingAmount}</p>
            <button className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/30 transition-all w-full uppercase tracking-wider text-sm">
              Pay Now
            </button>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full -z-10 group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="w-24 h-24 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner dark:bg-emerald-900/30 dark:border-emerald-500/20 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">All Clear!</h4>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">You have no pending fines at the moment.</p>
          </>
        )}
      </div>
      
      <div className="p-5 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 text-center relative z-10">
        <Link to="/member/fines" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-bold uppercase tracking-wider text-xs transition">
          View Fine History
        </Link>
      </div>
    </div>
  );
};

export default FinesWidget;
