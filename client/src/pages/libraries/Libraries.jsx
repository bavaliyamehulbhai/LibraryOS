import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { confirmAlert } from '../../utils/confirmAlert';

const Libraries = () => {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLibrary, setEditingLibrary] = useState(null);
  const [formData, setFormData] = useState({ name: '', city: '', state: '', phone: '' });

  useEffect(() => {
    fetchLibraries();
  }, []);

  const fetchLibraries = async () => {
    try {
      const res = await api.get('/v1/libraries');
      if (res.data.success) {
        setLibraries(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (lib) => {
    setEditingLibrary(lib);
    setFormData({ name: lib.name, city: lib.city || '', state: lib.state || '', phone: lib.phone || '', status: lib.status || 'TRIAL' });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/v1/libraries/${editingLibrary._id}`, formData);
      if (res.data.success) {
        toast.success("Library updated successfully");
        setIsEditModalOpen(false);
        fetchLibraries();
      }
    } catch (error) {
      console.error('Update failed', error);
      toast.error(error.response?.data?.message || 'Failed to update library');
    }
  };

  const handleDelete = async (id) => {
    if (await confirmAlert('Are you sure you want to delete this library?')) {
      try {
        await api.delete(`/v1/libraries/${id}`);
        toast.success("Library deleted successfully");
        fetchLibraries();
      } catch (error) {
        console.error('Delete failed', error);
        toast.error(error.response?.data?.message || 'Failed to delete library');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Libraries</h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Manage all registered libraries in the platform.</p>
        </div>
        <button 
          onClick={() => navigate('/onboarding')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          + Onboard Library
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 overflow-hidden relative z-10">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading libraries...</div>
        ) : libraries.length === 0 ? (
          <EmptyState 
            title="No Libraries Found" 
            description="Get started by onboarding your first library tenant." 
            actionText="Onboard Library"
            onAction={() => navigate('/onboarding')}
          />
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Library Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {libraries.map((lib) => (
                <tr key={lib._id} className="hover:bg-white/90 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {lib.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs font-mono">{lib.code}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {lib.subscriptionPlanId?.name || "Trial"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${lib.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {lib.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditClick(lib)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4 font-bold transition-colors">Edit</button>
                    <button onClick={() => handleDelete(lib._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-bold transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-2xl dark:bg-gray-800/90 rounded-3xl max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl border border-white/50 dark:border-gray-700/50 m-auto">
            <div className="p-8 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Library</h2>
            </div>
            <div className="px-8 pb-8 overflow-y-auto">
              <form onSubmit={handleUpdate} className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">City</label>
                <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">State</label>
                <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm">
                  <option value="TRIAL">TRIAL</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition-all">Save Changes</button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Libraries;
