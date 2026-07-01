import React, { useState } from 'react';

const ChatbotSettings = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">🤖</span> Chatbot Settings
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Configure auto-replies and Library Assistant Bot (Coming Soon).</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative">
          
          <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Library Assistant Bot</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
                  Automatically respond to member inquiries on WhatsApp. The bot can handle standard queries like checking fine status, viewing due dates, and basic catalog search.
                </p>
              </div>
              <label className="flex items-center cursor-pointer opacity-50" title="Coming Soon">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={enabled} readOnly />
                  <div className={`block w-14 h-8 rounded-full transition ${enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${enabled ? 'translate-x-6' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>

          <div className="p-8 relative">
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-b-2xl">
              <div className="bg-gray-900/80 text-white px-6 py-3 rounded-full font-bold shadow-xl border border-gray-700">
                🚀 Coming in Phase 18+ (AI Upgrade)
              </div>
            </div>

            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Command Triggers</h3>
            <div className="space-y-4 filter blur-[2px]">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-bold font-mono">FINE STATUS</span>
                  <p className="text-sm text-gray-500 mt-1">Replies with current outstanding fines.</p>
                </div>
                <button className="text-blue-600 font-bold text-sm">Edit Reply</button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-bold font-mono">BOOK STATUS</span>
                  <p className="text-sm text-gray-500 mt-1">Replies with currently borrowed books and due dates.</p>
                </div>
                <button className="text-blue-600 font-bold text-sm">Edit Reply</button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-bold font-mono">HELP</span>
                  <p className="text-sm text-gray-500 mt-1">Sends the main interactive menu to the user.</p>
                </div>
                <button className="text-blue-600 font-bold text-sm">Edit Reply</button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotSettings;
