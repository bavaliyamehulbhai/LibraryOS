import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AnnouncementManager = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('IN_APP');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !message) return toast.error("Title and Message are required");

    setLoading(true);
    try {
      const res = await api.post('/v1/notifications/bulk', { title, message, channel });
      if (res.data.success) {
        toast.success("Announcement broadcasted successfully!");
        setTitle('');
        setMessage('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 rounded-3xl shadow-lg text-white">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
           <span className="text-4xl">📢</span> Announcement Manager
        </h1>
        <p className="text-red-100">Broadcast system-wide messages and alerts to all users instantly.</p>
      </div>

      {/* Composer */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
         <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Compose Announcement</h2>
         </div>
         
         <form onSubmit={handleSend} className="p-8 space-y-6">
            <div className="space-y-2">
               <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Title</label>
               <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:border-red-500 transition-colors"
                  placeholder="e.g. Scheduled Maintenance, New Features Available"
                  required
               />
            </div>

            <div className="space-y-2">
               <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Message Content</label>
               <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:border-red-500 transition-colors resize-none"
                  placeholder="Type your announcement here..."
                  required
               ></textarea>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Delivery Channel</label>
               <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer p-4 border border-gray-200 dark:border-gray-700 rounded-xl flex-1 bg-white dark:bg-gray-900 has-[:checked]:border-red-500 has-[:checked]:bg-red-50 dark:has-[:checked]:bg-red-900/10">
                     <input type="radio" name="channel" value="IN_APP" checked={channel === 'IN_APP'} onChange={e => setChannel(e.target.value)} className="text-red-600 focus:ring-red-500" />
                     <span className="font-bold text-gray-700 dark:text-gray-300">📱 In-App Alerts</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer p-4 border border-gray-200 dark:border-gray-700 rounded-xl flex-1 bg-white dark:bg-gray-900 has-[:checked]:border-red-500 has-[:checked]:bg-red-50 dark:has-[:checked]:bg-red-900/10 opacity-50 cursor-not-allowed">
                     <input type="radio" name="channel" value="EMAIL" disabled className="text-red-600 focus:ring-red-500" />
                     <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between w-full">
                        <span>✉️ Email Blast</span>
                        <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Soon</span>
                     </span>
                  </label>
               </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
               <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
               >
                  {loading ? (
                     <span className="animate-spin text-xl">⏳</span>
                  ) : (
                     <>
                        <span className="text-xl">🚀</span>
                        Broadcast Now
                     </>
                  )}
               </button>
            </div>
         </form>
      </div>

    </div>
  );
};

export default AnnouncementManager;
