import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/reservations');
      if (res.data.success) {
        setReservations(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    try {
      const res = await api.put(`/v1/reservations/${id}/cancel`);
      if (res.data.success) {
        toast.success("Reservation cancelled.");
        fetchReservations();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleCollect = async (id) => {
    if (!window.confirm("Mark this book as collected?")) return;
    try {
      const res = await api.put(`/v1/reservations/${id}/collect`);
      if (res.data.success) {
        toast.success("Reservation collected!");
        // We still need to do issue transaction usually, but we will simplify and just mark collected.
        fetchReservations();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to collect');
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reservations & Holds</h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Manage waiting queues and ready-for-pickup books.</p>
          </div>
          <Link to="/reservations/new" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center font-medium shadow-sm">
            <span className="mr-2">🔖</span> Create Hold
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="p-4 font-medium">Res ID</th>
                    <th className="p-4 font-medium">Book</th>
                    <th className="p-4 font-medium">Member</th>
                    <th className="p-4 font-medium">Queue Pos</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Expiry</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No reservations found.
                      </td>
                    </tr>
                  ) : (
                    reservations.map(res => (
                      <tr key={res._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="p-4 font-mono font-medium text-gray-900 dark:text-white">{res.reservationCode}</td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900 dark:text-white">{res.bookId?.title}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900 dark:text-white">{res.memberId?.firstName} {res.memberId?.lastName}</div>
                          <div className="text-xs text-gray-500">{res.memberId?.memberCode}</div>
                        </td>
                        <td className="p-4">
                          {res.status === 'PENDING' ? (
                            <span className="font-bold text-gray-900 dark:text-white">#{res.queuePosition}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                            res.status === 'READY' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">
                          {res.expiryDate ? new Date(res.expiryDate).toLocaleString() : '-'}
                        </td>
                        <td className="p-4 text-right space-x-3">
                          {res.status === 'READY' && (
                            <button onClick={() => handleCollect(res._id)} className="text-green-600 hover:text-green-800 dark:text-green-400 font-bold text-sm transition">
                              Collect
                            </button>
                          )}
                          {(res.status === 'PENDING' || res.status === 'READY') && (
                            <button onClick={() => handleCancel(res._id)} className="text-red-600 hover:text-red-800 dark:text-red-400 font-bold text-sm transition">
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservations;
