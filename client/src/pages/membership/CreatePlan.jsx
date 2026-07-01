import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreatePlan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    borrowLimit: 5,
    issueDuration: 15,
    renewalLimit: 2,
    reservationLimit: 3,
    finePerDay: 5,
    planType: 'STUDENT',
    status: 'ACTIVE'
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'number' ? Number(value) : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/v1/membership-plans', formData);
      if (res.data.success) {
        toast.success('Membership plan created successfully!');
        navigate('/membership-plans');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Membership Plan</h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Configure rules and limits for a new plan.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Basic Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan Name *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. Student Premium" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan Category *</label>
                  <select required name="planType" value={formData.planType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition">
                    <option value="STUDENT">Student</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="GUEST">Guest</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Brief description of who this plan is for..."></textarea>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Borrowing Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Borrow Limit (Max Books) *</label>
                  <input required type="number" min="1" max="100" name="borrowLimit" value={formData.borrowLimit} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  <p className="mt-1 text-xs text-gray-500">Max books a member can hold at one time.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issue Duration (Days) *</label>
                  <input required type="number" min="1" max="365" name="issueDuration" value={formData.issueDuration} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  <p className="mt-1 text-xs text-gray-500">How many days before the book is due.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Renewals *</label>
                  <input required type="number" min="0" max="10" name="renewalLimit" value={formData.renewalLimit} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Reservations *</label>
                  <input required type="number" min="0" max="10" name="reservationLimit" value={formData.reservationLimit} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Financial Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-red-50/50 dark:bg-red-900/10 p-6 rounded-lg border border-red-100 dark:border-red-900/30">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fine Rate Per Day (₹) *</label>
                  <input required type="number" min="0" name="finePerDay" value={formData.finePerDay} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  <p className="mt-1 text-xs text-gray-500">Enter 0 for no fines.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition">
                    <option value="ACTIVE">Active (Available for assignment)</option>
                    <option value="INACTIVE">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-4">
              <button type="button" onClick={() => navigate('/membership-plans')} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center">
                {loading ? 'Creating...' : 'Create Membership Plan'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePlan;
