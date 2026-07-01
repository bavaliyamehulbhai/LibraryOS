import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
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
    address: {
      city: '',
      state: '',
      pincode: ''
    },
    contactInfo: {
      phone: '',
      email: ''
    }
  });

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
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/v1/branches', {
        name: formData.name,
        ...formData.address,
        ...formData.contactInfo
      });
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
      const res = await api.put(`/v1/branches/${editingBranch._id}`, editFormData);
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
    if (window.confirm('Are you sure you want to delete this branch?')) {
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
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
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
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            + Add New Branch
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map(branch => (
              <div key={branch._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate pr-4">{branch.branchName || branch.name}</h3>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded">
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
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center gap-2">
                  <button onClick={() => handleEditClick(branch)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                  <Link 
                    to={`/branches/${branch._id}`}
                    className="block py-2 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 text-center text-blue-600 dark:text-blue-400 font-medium rounded-lg transition text-sm flex-1"
                  >
                    Dashboard
                  </Link>
                  <button onClick={() => handleDelete(branch._id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Branch</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input 
                    type="text" 
                    value={formData.address.city}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium">Create Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Branch</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch Name</label>
                <input 
                  type="text" 
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input 
                    type="text" 
                    value={editFormData.address?.city}
                    onChange={(e) => setEditFormData({...editFormData, address: {...editFormData.address, city: e.target.value}})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
