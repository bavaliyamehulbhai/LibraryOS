import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { confirmAlert } from '../../utils/confirmAlert';
import { Link } from 'react-router-dom';

const ImageWithFallback = ({ src, alt, className, iconSize = "w-6 h-6" }) => {
  const [error, setError] = useState(false);
  
  if (!src || error) {
    return (
      <div className={`w-full h-full flex items-center justify-center text-gray-400 bg-gray-200 dark:bg-gray-700`}>
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
      </div>
    );
  }
  
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

const MemberReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/member-dashboard/reservations');
      if (res.data.success) {
        setReservations(res.data.data);
      }
    } catch (error) {
      console.error("Reservations error:", error);
      toast.error(error.response?.data?.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!(await confirmAlert("Are you sure you want to cancel this reservation?"))) return;
    try {
      const res = await api.put(`/v1/member-dashboard/reservations/${id}/cancel`);
      if (res.data.success) {
        toast.success("Reservation cancelled successfully");
        fetchReservations(); // Refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeReservations = reservations.filter(r => ['PENDING', 'READY'].includes(r.status));
  const pastReservations = reservations.filter(r => !['PENDING', 'READY'].includes(r.status));

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">🔖</span> My Reservations
            </h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400">Track the books you have reserved.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <Link to="/member/catalog" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition flex items-center">
              <span className="mr-2">🔍</span> Browse Catalog
            </Link>
          </div>
        </div>

        {/* Active Reservations */}
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/40 border border-white/50 dark:border-gray-700/50 overflow-hidden mb-8">
          <div className="p-5 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700/50 border-b border-white/50 dark:border-gray-700/50">
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">Active Reservations ({activeReservations.length})</h2>
          </div>
          
          {activeReservations.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <div className="text-5xl mb-4">🎫</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active reservations</h3>
              <p>You haven't reserved any books currently.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {activeReservations.map(reservation => (
                <div key={reservation._id} className="p-6 flex flex-col md:flex-row md:items-center hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-300 group">
                  <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm flex-shrink-0 mb-4 md:mb-0 md:mr-6 group-hover:shadow-md transition-shadow">
                    <ImageWithFallback src={reservation.bookId?.coverImage} alt={reservation.bookId?.title} className="w-full h-full object-cover" iconSize="w-8 h-8" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-4">{reservation.bookId?.title || 'Unknown Book'}</h4>
                      {reservation.status === 'READY' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full uppercase flex-shrink-0">
                          Ready for Pickup
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-bold rounded-full uppercase flex-shrink-0">
                          Waitlisted
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">By {reservation.bookId?.authors?.join(', ') || 'Unknown Author'}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <span className="mr-1">🕒</span>
                        Reserved On: {new Date(reservation.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">🔢</span>
                        Queue Position: {reservation.queuePosition || 1}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                    <button 
                      onClick={() => handleCancel(reservation._id)}
                      className="px-5 py-2.5 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white font-bold tracking-wide rounded-xl text-sm transition-all shadow-sm hover:shadow-lg hover:shadow-red-500/30"
                    >
                      Cancel Reservation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Reservations (if any) */}
        {pastReservations.length > 0 && (
          <div className="bg-white/60 backdrop-blur-md dark:bg-gray-800/60 rounded-3xl shadow-md border border-white/30 dark:border-gray-700/30 overflow-hidden opacity-80 hover:opacity-100 transition-opacity duration-300">
            <div className="p-5 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700/50 border-b border-white/30 dark:border-gray-700/30">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">Past Reservations</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {pastReservations.map(reservation => (
                <div key={reservation._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="flex items-center">
                    <div className="w-10 h-14 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0 mr-4">
                      <ImageWithFallback src={reservation.bookId?.coverImage} alt={reservation.bookId?.title} className="w-full h-full object-cover" iconSize="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{reservation.bookId?.title || 'Unknown Book'}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(reservation.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${
                    reservation.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                    reservation.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {reservation.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MemberReservations;
