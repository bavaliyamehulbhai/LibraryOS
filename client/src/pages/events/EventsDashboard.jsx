import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EventsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/v1/events');
      if (res.data.success) {
        setEvents(res.data.data.filter(e => e.status === 'PUBLISHED'));
      }
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const res = await api.post(`/v1/events/${eventId}/register`);
      if (res.data.success) {
        toast.success(res.data.message);
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
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Library Events & Workshops
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Join our community! Register for upcoming workshops, seminars, and book fairs.
        </p>
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
          {events.map((event) => (
            <div key={event._id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col group">
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-4xl bg-blue-50 dark:bg-blue-900/30 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getTypeIcon(event.eventType)}
                  </span>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {event.eventType}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight">
                  {event.title}
                </h3>
                
                <p className="text-gray-500 dark:text-gray-400 mb-6 line-clamp-3 text-sm leading-relaxed">
                  {event.description}
                </p>
                
                <div className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="w-6 text-blue-500">📅</span>
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="w-6 text-purple-500">📍</span>
                    {event.venue}
                  </div>
                  <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="w-6 text-green-500">👥</span>
                    Max {event.maxParticipants} Participants
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={() => handleRegister(event._id)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                >
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsDashboard;
