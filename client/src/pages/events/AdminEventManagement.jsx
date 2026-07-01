import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

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
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3 text-4xl">🎟️</span> Event Management
          </h1>
          <p className="text-gray-500 mt-2">Manage library workshops, mark attendance, and generate AI insights.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition shadow-md shadow-purple-500/30 flex items-center"
        >
          <span className="mr-2">➕</span> Create Event
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => { setActiveTab('events'); setSelectedEventId(null); }}
          className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'events' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
        >
          All Events
        </button>
        {selectedEventId && (
          <button 
            className="px-6 py-2 rounded-full font-bold bg-purple-600 text-white"
          >
            Registrations & Attendance
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
      ) : activeTab === 'events' ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Event Title</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Type</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Date</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{event.title}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{event.eventType}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{new Date(event.startDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      {event.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                     <button 
                        onClick={() => fetchRegistrations(event._id)}
                        className="text-purple-600 hover:text-purple-800 font-bold bg-purple-50 px-4 py-2 rounded-lg"
                     >
                        View Attendees
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Event</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-red-500 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
               {/* AI Idea Generator */}
               <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 p-6 rounded-2xl mb-6">
                  <h3 className="font-bold flex items-center text-indigo-900 dark:text-indigo-300 mb-2">
                     <span className="text-xl mr-2">✨</span> AI Event Assistant
                  </h3>
                  <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">Not sure what to write? Enter a topic and let Grok AI generate a catchy title and professional description.</p>
                  <div className="flex gap-2">
                     <input 
                        type="text" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. AI for beginners"
                        className="flex-1 p-3 border border-indigo-200 dark:border-indigo-700 rounded-xl bg-white dark:bg-gray-800"
                     />
                     <button 
                        type="button"
                        onClick={handleAIGenerate}
                        disabled={isGenerating}
                        className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition disabled:opacity-50"
                     >
                        {isGenerating ? "Thinking..." : "Generate"}
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
              <button onClick={() => setShowModal(false)} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-xl">Cancel</button>
              <button form="eventForm" type="submit" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md">Publish Event</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminEventManagement;
