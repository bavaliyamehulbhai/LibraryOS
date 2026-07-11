import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { confirmAlert } from '../../utils/confirmAlert';
import { Link } from 'react-router-dom';

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', address: { city: '' } });
  const [formData, setFormData] = useState({
    name: '',
    libraryId: '',
    address: {
      addressLine1: '',
      city: '',
      state: '',
      pincode: ''
    },
    contactInfo: {
      phone: '',
      email: ''
    }
  });
  const [librariesList, setLibrariesList] = useState([]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/branches');
      if (res.data.success) {
        setBranches(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchLibrariesForDropdown();
  }, []);

  const fetchLibrariesForDropdown = async () => {
    try {
      const res = await api.get('/v1/libraries');
      if (res.data.success) {
        setLibrariesList(res.data.data);
      }
    } catch (error) {
      // User might not be SUPER_ADMIN, ignore safely
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        city: formData.address.city,
        state: formData.address.state,
        phone: formData.contactInfo.phone,
        email: formData.contactInfo.email
      };
      if (formData.libraryId) {
        payload.libraryId = formData.libraryId;
      }
      
      const res = await api.post('/v1/branches', payload);
      if (res.data.success) {
        toast.success('Branch created successfully!');
        setShowModal(false);
        fetchBranches();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create branch');
    }
  };

  const handleEditClick = (branch) => {
    setEditingBranch(branch);
    setEditFormData({
      name: branch.branchName || branch.name,
      address: { city: branch.address?.city || branch.city || '' }
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatePayload = {
        name: editFormData.name,
        address: editFormData.address,
        city: editFormData.address?.city,
        state: editFormData.address?.state
      };
      const res = await api.put(`/v1/branches/${editingBranch._id}`, updatePayload);
      if (res.data.success) {
        toast.success('Branch updated successfully!');
        setShowEditModal(false);
        fetchBranches();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update branch');
    }
  };

  const handleDelete = async (id) => {
    if (await confirmAlert('Are you sure you want to delete this branch?')) {
      try {
        await api.delete(`/v1/branches/${id}`);
        toast.success('Branch deleted');
        fetchBranches();
      } catch (error) {
        toast.error('Failed to delete branch');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">🏢</span> Multi-Branch Management
            </h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400">Manage your library locations and view branch performance.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            + Add New Branch
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {branches.map(branch => (
              <div key={branch._id} className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="p-6 flex-1 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-900/10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate pr-4">{branch.branchName || branch.name}</h3>
                    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-black rounded-lg shadow-inner">
                      {branch.branchCode}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <div className="flex items-start">
                      <span className="mr-2 mt-0.5">📍</span>
                      <p>{branch.address?.city || branch.city ? `${branch.address?.city || branch.city}` : 'Location not specified'}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-white/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 flex justify-between items-center gap-2">
                  <button onClick={() => handleEditClick(branch)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-bold transition-colors">Edit</button>
                  <Link 
                    to={`/branches/${branch._id}`}
                    className="block py-2.5 px-4 bg-white/80 dark:bg-gray-700 border border-white/50 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 text-center text-blue-600 dark:text-blue-300 font-bold rounded-xl shadow-sm hover:shadow transition-all text-sm flex-1"
                  >
                    Dashboard
                  </Link>
                  <button onClick={() => handleDelete(branch._id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-bold transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-2xl dark:bg-gray-800/90 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 w-full max-w-lg p-8 max-h-[85vh] flex flex-col m-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Add New Branch</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Enter branch details and assign it to a library.</p>
            <div className="overflow-y-auto pr-2 custom-scrollbar">
            <form onSubmit={handleCreate} className="space-y-4">
              {librariesList.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Select Library</label>
                  <select 
                    required
                    value={formData.libraryId}
                    onChange={(e) => setFormData({...formData, libraryId: e.target.value})}
                    className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm"
                  >
                    <option value="">-- Choose Library --</option>
                    {librariesList.map(lib => (
                      <option key={lib._id} value={lib._id}>{lib.name} ({lib.code})</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Branch Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                <input 
                  type="text" 
                  value={formData.address.addressLine1}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, addressLine1: e.target.value}})}
                  className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input 
                    type="text" 
                    required
                    value={formData.address.city}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                    className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <input 
                    type="text" 
                    value={formData.address.state}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})}
                    className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email (Optional)</label>
                  <input 
                    type="email" 
                    value={formData.contactInfo.email}
                    onChange={(e) => setFormData({...formData, contactInfo: {...formData.contactInfo, email: e.target.value}})}
                    className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={formData.contactInfo.phone}
                    onChange={(e) => setFormData({...formData, contactInfo: {...formData.contactInfo, phone: e.target.value}})}
                    className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/50">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">Create Branch</button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-2xl dark:bg-gray-800/90 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Branch</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Branch Name</label>
                <input 
                  type="text" 
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input 
                    type="text" 
                    value={editFormData.address?.city}
                    onChange={(e) => setEditFormData({...editFormData, address: {...editFormData.address, city: e.target.value}})}
                    className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/50">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
