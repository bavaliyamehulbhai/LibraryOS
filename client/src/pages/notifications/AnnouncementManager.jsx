import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Megaphone, Send, Clock, Trash2, Smartphone, Mail, Globe, 
  Search, X, Sparkles, AlertTriangle, CheckCircle2, ArrowLeft,
  Radio, Eye
} from 'lucide-react';

const AnnouncementManager = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('IN_APP');
  const [priority, setPriority] = useState('NORMAL');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/v1/notifications/bulk');
      if (res.data.success) {
        setHistory(res.data.data || []);
      }
    } catch {
      console.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      return toast.error("Title and Message are required");
    }

    setLoading(true);
    try {
      const res = await api.post('/v1/notifications/bulk', { 
        title, 
        message, 
        channel,
        priority
      });
      if (res.data.success) {
        toast.success("Broadcast dispatched across library network!");
        setTitle('');
        setMessage('');
        fetchHistory();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send announcement");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (item.title || '').toLowerCase().includes(q) || (item.message || '').toLowerCase().includes(q);
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 pb-20 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link 
            to="/notifications" 
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1.5 mb-2 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Notification Center</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-orange-500 to-red-500 text-white shadow-md">
              <Megaphone size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Announcement Dispatcher</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  Campus Broadcaster
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Broadcast system-wide notices, urgent maintenance advisories, and policy changes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Broadcast Gateway Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Composer Column */}
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <Send size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Compose Broadcast</h2>
                <p className="text-xs text-slate-400">Enter headline and details for transmission</p>
              </div>
            </div>
          
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Headline
                </label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 transition"
                  placeholder="e.g. Scheduled System Maintenance on Sunday"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Message Content
                </label>
                <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 transition resize-none leading-relaxed"
                  placeholder="Provide complete information and guidance for library patrons..."
                  required
                ></textarea>
              </div>

              {/* Priority Chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Alert Urgency
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'NORMAL', label: 'Standard Notice', color: 'border-blue-500 text-blue-600 bg-blue-500/10' },
                    { id: 'IMPORTANT', label: 'Important Notice', color: 'border-amber-500 text-amber-600 bg-amber-500/10' },
                    { id: 'URGENT', label: 'Critical / Urgent', color: 'border-rose-500 text-rose-600 bg-rose-500/10' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`p-2 rounded-xl font-bold border transition-all text-center ${
                        priority === p.id 
                          ? p.color + ' shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Vector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Delivery Channel
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${
                    channel === 'IN_APP'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input 
                      type="radio" 
                      name="channel" 
                      value="IN_APP" 
                      checked={channel === 'IN_APP'} 
                      onChange={e => setChannel(e.target.value)} 
                      className="hidden" 
                    />
                    <Smartphone size={16} />
                    <span>In-App Banner Stream</span>
                  </label>
                  
                  <label className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${
                    channel === 'EMAIL'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input 
                      type="radio" 
                      name="channel" 
                      value="EMAIL" 
                      checked={channel === 'EMAIL'} 
                      onChange={e => setChannel(e.target.value)} 
                      className="hidden" 
                    />
                    <Mail size={16} />
                    <span>Email Broadcast</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Globe size={18} />
                    <span>Transmit Broadcast Now</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Eye size={14} /> Recipient Preview
              </span>
              <span className="font-mono text-[10px]">What Patrons See</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <Megaphone size={12} /> {priority} ANNOUNCEMENT
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Just Now</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {title || 'Headline will appear here...'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {message || 'The full announcement text description will render in this card.'}
              </p>
            </div>
          </div>
        </div>

        {/* History Column */}
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400">
                <Clock size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Broadcast Archive</h2>
                <p className="text-xs text-slate-400">Historical network transmissions</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
              {history.length}
            </span>
          </div>

          {/* Search Bar for History */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Filter archived announcements..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto max-h-[640px] space-y-3">
            {loadingHistory ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Megaphone size={22} className="text-slate-400" />
                </div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300">No Announcements Found</h4>
                <p className="text-xs">Transmit your first campus broadcast using the composer.</p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div 
                  key={item._id} 
                  className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {item.title}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 shrink-0">
                      {item.channel || 'IN_APP'}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs mb-3 line-clamp-3 leading-relaxed">
                    {item.message}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
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
