import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Users, Ticket, CheckCircle, Sparkles } from 'lucide-react';

const EventsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch events first
      const eventsRes = await api.get('/v1/events');
      if (eventsRes.data.success) {
        setEvents(eventsRes.data.data.filter(e => e.status === 'PUBLISHED'));
      }
      
      // Fetch registrations separately so it doesn't break the page if it fails
      try {
        const regsRes = await api.get('/v1/events/my-registrations');
        if (regsRes.data.success) {
           const regMap = {};
           regsRes.data.data.forEach(reg => {
              regMap[reg.eventId] = reg.status;
           });
           setMyRegistrations(regMap);
        }
      } catch (regError) {
        console.error("Failed to fetch my-registrations:", regError);
        toast.error("Registration fetch failed: " + (regError.response?.data?.message || regError.message));
      }

    } catch (error) {
      console.error("Fetch Events Error:", error);
      toast.error("Failed to load events: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const res = await api.post(`/v1/events/${eventId}/register`);
      if (res.data.success) {
        toast.success(res.data.message);
        // Update local state
        setMyRegistrations(prev => ({
           ...prev,
           [eventId]: res.data.data.status // REGISTERED or WAITLISTED
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'WORKSHOP': return '🛠️';
      case 'SEMINAR': return '🎙️';
      case 'BOOK_FAIR': return '📚';
      case 'COMPETITION': return '🏆';
      default: return '📅';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-950 p-12 rounded-[2.5rem] shadow-2xl text-center mb-12 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 dark:opacity-5 mix-blend-overlay"></div>
        <div className="absolute -right-20 -top-20 bg-white/10 dark:bg-black/10 w-96 h-96 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-1000"></div>
        <div className="absolute -left-20 bottom-0 bg-blue-400/20 dark:bg-indigo-900/40 w-80 h-80 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
           <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
              <Ticket className="text-white" size={40} />
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-md">
             Library Events & Workshops
           </h1>
           <p className="text-xl text-indigo-100 max-w-2xl mx-auto font-medium">
             Join our vibrant community! Register for upcoming workshops, seminars, and exclusive book fairs.
           </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-2xl border border-gray-100 dark:border-gray-700">
          <span className="text-6xl mb-4 inline-block opacity-50">🗓️</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Upcoming Events</h2>
          <p className="text-gray-500">Check back later for new workshops and seminars.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const regStatus = myRegistrations[event._id];
            const isFull = event.registeredCount >= event.maxParticipants;
            
            return (
               <div key={event._id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col group relative">
                 <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 to-transparent dark:from-indigo-900/20 rounded-bl-full -z-0"></div>
                 
                 <div className="p-8 flex-1 relative z-10 flex flex-col">
                   <div className="flex justify-between items-start mb-6">
                     <span className="text-4xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                       {getTypeIcon(event.eventType)}
                     </span>
                     <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                       {event.eventType}
                     </span>
                   </div>
                   
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                     {event.title}
                   </h3>
                   
                   <p className="text-gray-500 dark:text-gray-400 mb-6 line-clamp-3 text-sm leading-relaxed flex-1">
                     {event.description}
                   </p>
                   
                   <div className="space-y-3 mb-2 bg-gray-50/80 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm mt-auto">
                     <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                       <Calendar className="w-5 h-5 text-indigo-500 mr-3" />
                       {new Date(event.startDate).toLocaleDateString()}
                     </div>
                     <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                       <MapPin className="w-5 h-5 text-purple-500 mr-3" />
                       <span className="truncate">{event.venue}</span>
                     </div>
                     <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                       <Users className="w-5 h-5 text-fuchsia-500 mr-3" />
                       Max {event.maxParticipants} Participants
                     </div>
                   </div>
                 </div>
                 
                 <div className="p-5 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 relative z-10">
                   {regStatus === 'REGISTERED' ? (
                     <div className="w-full py-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-black rounded-xl flex items-center justify-center gap-2 border border-green-200 dark:border-green-800/50">
                        <CheckCircle size={20} /> You're Registered!
                     </div>
                   ) : regStatus === 'WAITLISTED' ? (
                     <div className="w-full py-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 font-black rounded-xl flex items-center justify-center gap-2 border border-yellow-200 dark:border-yellow-800/50">
                        ⏳ You're on the Waitlist
                     </div>
                   ) : (
                     <button 
                       onClick={() => handleRegister(event._id)}
                       className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center gap-2"
                     >
                       Register Now <Sparkles size={18} />
                     </button>
                   )}
                 </div>
               </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsDashboard;
