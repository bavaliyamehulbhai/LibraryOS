import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Ticket, Plus, Users, Sparkles, CheckCircle, Clock, Calendar as CalendarIcon, MapPin, X } from 'lucide-react';

const AdminEventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('events'); // events, registrations
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "WORKSHOP",
    startDate: "",
    endDate: "",
    venue: "",
    maxParticipants: 50
  });

  // AI State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/v1/events');
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId) => {
    try {
      const res = await api.get(`/v1/events/${eventId}/registrations`);
      if (res.data.success) {
        setRegistrations(res.data.data);
        setSelectedEventId(eventId);
        setActiveTab('registrations');
      }
    } catch (error) {
      toast.error("Failed to load registrations");
    }
  };

  const markAttendance = async (regId) => {
    try {
      const res = await api.put(`/v1/events/registrations/${regId}/attendance`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchRegistrations(selectedEventId); // Refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark attendance");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/v1/events', formData);
      if (res.data.success) {
        toast.success("Event created successfully");
        setShowModal(false);
        fetchEvents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create event");
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt) return toast.error("Please enter a topic");
    setIsGenerating(true);
    try {
      const res = await api.post('/v1/events/ai-generate', { prompt: aiPrompt });
      if (res.data.success) {
        setFormData(prev => ({
          ...prev,
          title: res.data.data.title,
          description: res.data.data.description
        }));
        toast.success("AI generated content applied!");
      }
    } catch (error) {
      toast.error("Failed to generate AI content");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-fuchsia-600 to-purple-700 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden group mb-8">
        <div className="absolute -right-10 -top-10 bg-white/10 w-64 h-64 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="absolute -left-10 bottom-0 bg-fuchsia-400/20 w-40 h-40 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black mb-3 flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><Ticket size={32} /></div> 
              Event Management
            </h1>
            <p className="text-purple-100 text-lg">Manage library workshops, mark attendance, and generate AI insights.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-6 py-4 bg-white text-purple-700 hover:bg-gray-50 font-black rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2"
          >
            <Plus size={20} /> Create Event
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 inline-flex">
        <button 
          onClick={() => { setActiveTab('events'); setSelectedEventId(null); }}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'events' ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
          All Events
        </button>
        {selectedEventId && (
          <button 
            className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md"
          >
            Registrations & Attendance
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
      ) : activeTab === 'events' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {events.map((event) => (
             <div key={event._id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
                <div className="h-32 bg-gradient-to-br from-purple-100 to-fuchsia-50 dark:from-purple-900/30 dark:to-fuchsia-900/10 relative p-6 flex items-start justify-between border-b border-gray-100 dark:border-gray-700">
                   <span className="inline-block px-3 py-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm">
                     {event.eventType}
                   </span>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                     {event.status}
                   </span>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                   <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{event.title}</h3>
                   <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-6">{event.description}</p>
                   
                   <div className="space-y-3 mt-auto">
                      <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                         <CalendarIcon size={16} className="text-purple-500 mr-3" />
                         {new Date(event.startDate).toLocaleDateString()} at {new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                         <MapPin size={16} className="text-fuchsia-500 mr-3" />
                         <span className="truncate">{event.venue}</span>
                      </div>
                   </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                   <button 
                      onClick={() => fetchRegistrations(event._id)}
                      className="w-full py-3 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                   >
                      <Users size={18} /> View Attendees
                   </button>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
           <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Event Registrations</h2>
              <p className="text-sm text-gray-500">Mark attendance to automatically generate certificates.</p>
           </div>
           {registrations.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No registrations yet for this event.</div>
           ) : (
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                       <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Name</th>
                       <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Email</th>
                       <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                       <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Certificate</th>
                       <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody>
                    {registrations.map(reg => (
                       <tr key={reg._id} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="p-4 font-bold text-gray-900 dark:text-white">{reg.userId?.firstName} {reg.userId?.lastName}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-400">{reg.userId?.email}</td>
                          <td className="p-4">
                             <span className={`px-3 py-1 rounded-full text-xs font-bold ${reg.status === 'ATTENDED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {reg.status}
                             </span>
                          </td>
                          <td className="p-4">
                             {reg.certificateIssued ? <span className="text-green-500 text-xl">✅</span> : <span className="text-gray-300 text-xl">⏳</span>}
                          </td>
                          <td className="p-4 text-right">
                             {reg.status !== 'ATTENDED' && (
                                <button 
                                   onClick={() => markAttendance(reg._id)}
                                   className="text-white font-bold bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition"
                                >
                                   Mark Attended
                                </button>
                             )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                 <Ticket className="text-purple-600" /> Create New Event
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
               <div className="bg-gradient-to-br from-fuchsia-50 to-purple-50 dark:from-fuchsia-900/10 dark:to-purple-900/20 border border-fuchsia-100 dark:border-purple-800/30 p-6 rounded-3xl mb-8 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-purple-200/50 to-transparent dark:from-purple-800/30 rounded-bl-full -z-0"></div>
                  <h3 className="font-black flex items-center text-purple-900 dark:text-purple-300 mb-2 relative z-10 text-lg">
                     <Sparkles className="text-fuchsia-500 mr-2" size={20} /> AI Event Assistant
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-400 mb-4 relative z-10 font-medium">Not sure what to write? Enter a topic and let Grok AI generate a catchy title and professional description.</p>
                  <div className="flex gap-3 relative z-10">
                     <input 
                        type="text" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. AI for beginners"
                        className="flex-1 p-4 border border-purple-200 dark:border-purple-700/50 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                     />
                     <button 
                        type="button"
                        onClick={handleAIGenerate}
                        disabled={isGenerating}
                        className="px-8 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none flex items-center gap-2"
                     >
                        {isGenerating ? <><span className="animate-spin">⏳</span> Thinking...</> : <><Sparkles size={18} /> Generate</>}
                     </button>
                  </div>
               </div>

              <form id="eventForm" onSubmit={handleCreateSubmit} className="space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Event Title</label>
                    <input 
                       type="text" 
                       required 
                       value={formData.title} 
                       onChange={(e) => setFormData({...formData, title: e.target.value})}
                       className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-lg"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea 
                       required 
                       rows="3"
                       value={formData.description} 
                       onChange={(e) => setFormData({...formData, description: e.target.value})}
                       className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                 </div>
                 
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Event Type</label>
                    <select 
                      value={formData.eventType} 
                      onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                    >
                      <option value="WORKSHOP">Workshop</option>
                      <option value="SEMINAR">Seminar</option>
                      <option value="BOOK_FAIR">Book Fair</option>
                      <option value="COMPETITION">Competition</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Max Capacity</label>
                    <input 
                      type="number" 
                      required 
                      value={formData.maxParticipants} 
                      onChange={(e) => setFormData({...formData, maxParticipants: Number(e.target.value)})}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Start Date & Time</label>
                    <input 
                      type="datetime-local" 
                      required 
                      value={formData.startDate} 
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">End Date & Time</label>
                    <input 
                      type="datetime-local" 
                      required 
                      value={formData.endDate} 
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Venue</label>
                   <input 
                      type="text" 
                      required 
                      value={formData.venue} 
                      onChange={(e) => setFormData({...formData, venue: e.target.value})}
                      placeholder="e.g. Main Auditorium"
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                   />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
              <button form="eventForm" type="submit" className="px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-black rounded-xl shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all">Publish Event</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminEventManagement;
