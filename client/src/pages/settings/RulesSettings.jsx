import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Save, AlertCircle } from 'lucide-react';

const RulesSettings = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState({
    finePerDay: 5,
    maxBorrowDays: 14,
    maxBooksPerStudent: 3
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        finePerDay: initialData.finePerDay ?? 5,
        maxBorrowDays: initialData.maxBorrowDays ?? 14,
        maxBooksPerStudent: initialData.maxBooksPerStudent ?? 3
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) || 0 });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/v1/settings/rules", formData);
      toast.success("Rules settings saved successfully");
      if (onSave) onSave();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-3xl animate-fade-in">
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50 p-6 rounded-2xl mb-8 flex gap-4 items-start shadow-inner">
        <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-extrabold text-blue-900 dark:text-blue-300">Library Automation Rules</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">These rules automatically govern the background jobs calculating fines and managing student quotas. They affect all members universally.</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Fine Per Day (Overdue Amount)</label>
          <div className="relative rounded-xl shadow-sm w-full md:w-2/3">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400 font-bold">₹</span>
            </div>
            <input type="number" name="finePerDay" value={formData.finePerDay} onChange={handleChange} 
              className="pl-9 block w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none" />
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Amount charged automatically every night for overdue books.</p>
        </div>

        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Maximum Borrow Days</label>
          <input type="number" name="maxBorrowDays" value={formData.maxBorrowDays} onChange={handleChange} 
            className="block w-full md:w-2/3 bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none" />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Number of days a student can keep a book before it becomes overdue.</p>
        </div>

        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Maximum Books Per Student</label>
          <input type="number" name="maxBooksPerStudent" value={formData.maxBooksPerStudent} onChange={handleChange} 
            className="block w-full md:w-2/3 bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none" />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Maximum active borrowed books allowed at the same time.</p>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <Save className="w-5 h-5" />
          {loading ? "Saving..." : "Save Library Rules"}
        </button>
      </div>
    </form>
  );
};

export default RulesSettings;
