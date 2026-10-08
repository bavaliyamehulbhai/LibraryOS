import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { X, Plus, AlertCircle, HelpCircle, Send } from 'lucide-react';

const CreateTicket = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'Technical Issue',
    priority: 'MEDIUM',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    "Technical Issue",
    "Bug Report",
    "Feature Request",
    "Barcode Scanner Hardware",
    "Billing & Subscription",
    "Account / Permission Issue",
    "Training & Onboarding",
    "Other"
  ];
  
  const priorities = [
    { id: "LOW", label: "Low", color: "border-blue-500 text-blue-600 bg-blue-500/10" },
    { id: "MEDIUM", label: "Medium", color: "border-amber-500 text-amber-600 bg-amber-500/10" },
    { id: "HIGH", label: "High", color: "border-orange-500 text-orange-600 bg-orange-500/10" },
    { id: "CRITICAL", label: "Critical", color: "border-rose-500 text-rose-600 bg-rose-500/10" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error("Subject and description are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/v1/tickets', formData);
      if (res.data.success) {
        toast.success(`Ticket ${res.data.data.ticketNumber} created! Our engineers are reviewing it.`);
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Open Support Ticket</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                SLA Tracked
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Submit an issue report directly to our library infrastructure team.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Subject Headline
            </label>
            <input
              type="text"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Optical barcode scanner failing on ISBN-13"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Issue Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Severity Level
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {priorities.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: p.id }))}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      formData.priority === p.id 
                        ? p.color + ' shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Detailed Description & Steps to Reproduce
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Explain the unexpected behavior, error codes, and steps to reproduce..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none leading-relaxed"
            ></textarea>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={14} />
              <span>{submitting ? 'Submitting Ticket...' : 'Dispatch Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
