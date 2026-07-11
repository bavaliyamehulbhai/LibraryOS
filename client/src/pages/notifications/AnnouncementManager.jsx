import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Megaphone, Send, Clock, Trash2, Smartphone, Mail, Globe } from 'lucide-react';

const AnnouncementManager = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('IN_APP');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/v1/notifications/bulk');
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

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
        fetchHistory(); // refresh the list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 bg-white/10 w-64 h-64 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="absolute -left-10 bottom-0 bg-orange-400/20 w-40 h-40 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-3 flex items-center gap-4">
             <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><Megaphone size={32} /></div> 
             Announcement Manager
          </h1>
          <p className="text-red-100 text-lg">Broadcast system-wide messages and alerts to all users instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Composer */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
           <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-white dark:from-gray-800 dark:to-gray-800 flex items-center gap-3">
              <Send className="text-orange-500" size={20} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Compose Broadcast</h2>
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
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black rounded-xl shadow-lg hover:shadow-orange-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
               >
                  {loading ? (
                     <span className="animate-spin text-xl">⏳</span>
                  ) : (
                     <>
                        <Globe size={20} />
                        Broadcast Now
                     </>
                  )}
               </button>
            </div>
         </form>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
           <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 flex items-center gap-3">
              <Clock className="text-gray-500 dark:text-gray-400" size={20} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Broadcast History</h2>
           </div>
           
           <div className="flex-1 p-6 overflow-y-auto max-h-[600px] space-y-4">
              {loadingHistory ? (
                <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>
              ) : history.length === 0 ? (
                <div className="text-center p-12 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                   <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <Megaphone size={24} className="text-gray-400" />
                   </div>
                   <p className="font-bold text-gray-700 dark:text-gray-300">No announcements yet</p>
                   <p className="text-sm">Broadcast your first message to see it here.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item._id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg pr-4">{item.title}</h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 whitespace-nowrap">
                        {item.channel}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{item.message}</p>
                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                      <Clock size={12} className="mr-1" />
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>

    </div>
  );
};

export default AnnouncementManager;
