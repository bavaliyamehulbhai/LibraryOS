import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { confirmAlert } from '../../utils/confirmAlert';

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
    if (!(await confirmAlert("Are you sure you want to cancel this reservation?"))) return;
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
    if (!(await confirmAlert("Mark this book as collected?"))) return;
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
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reservations & Holds</h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Manage waiting queues and ready-for-pickup books.</p>
          </div>
          <Link to="/reservations/new" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center font-bold hover:shadow-lg hover:-translate-y-0.5">
            <span className="mr-2">🔖</span> Create Hold
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-200 dark:border-gray-700">
                    <th className="p-5">Res ID</th>
                    <th className="p-5">Book</th>
                    <th className="p-5">Member</th>
                    <th className="p-5">Queue Pos</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Expiry</th>
                    <th className="p-5 text-right">Actions</th>
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
                      <tr key={res._id} className="hover:bg-white/90 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 group">
                        <td className="p-5 font-mono font-bold text-gray-900 dark:text-white">{res.reservationCode}</td>
                        <td className="p-5">
                          <div className="font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{res.bookId?.title}</div>
                        </td>
                        <td className="p-5">
                          <div className="font-bold text-gray-900 dark:text-white">{res.memberId?.firstName} {res.memberId?.lastName}</div>
                          <div className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 inline-block px-2 py-0.5 rounded mt-1">{res.memberId?.memberCode}</div>
                        </td>
                        <td className="p-5">
                          {res.status === 'PENDING' ? (
                            <span className="font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800">#{res.queuePosition}</span>
                          ) : (
                            <span className="text-gray-400 font-bold">-</span>
                          )}
                        </td>
                        <td className="p-5">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm border ${
                            res.status === 'READY' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' :
                            res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="p-5 text-gray-600 dark:text-gray-300 font-medium">
                          {res.expiryDate ? new Date(res.expiryDate).toLocaleString() : '-'}
                        </td>
                        <td className="p-5 text-right space-x-2">
                          {res.status === 'READY' && (
                            <button onClick={() => handleCollect(res._id)} className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/50 rounded-lg font-bold text-sm transition-all shadow-sm">
                              Collect
                            </button>
                          )}
                          {(res.status === 'PENDING' || res.status === 'READY') && (
                            <button onClick={() => handleCancel(res._id)} className="px-4 py-2 bg-white/50 text-red-600 border border-gray-200 hover:bg-red-50 hover:border-red-200 dark:bg-gray-700/50 dark:text-red-400 dark:border-gray-600 dark:hover:bg-red-900/30 dark:hover:border-red-800 rounded-lg font-bold text-sm transition-all shadow-sm">
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
