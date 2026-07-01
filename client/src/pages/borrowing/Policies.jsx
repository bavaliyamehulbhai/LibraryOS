import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PLAN_COLORS = {
  STUDENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  TEACHER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  FACULTY: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  GUEST: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  PREMIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
};

const EditPlanModal = ({ plan, onClose, onSave }) => {
  const [form, setForm] = useState({
    borrowLimit: plan.borrowLimit,
    reservationLimit: plan.reservationLimit,
    renewalLimit: plan.renewalLimit,
    issueDuration: plan.issueDuration,
    finePerDay: plan.finePerDay
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: Number(e.target.value) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/v1/borrowing-limits/policies/${plan._id}`, form);
      if (res.data.success) {
        toast.success("Policy updated!");
        onSave(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'borrowLimit', label: 'Max Books', icon: '📚' },
    { key: 'reservationLimit', label: 'Max Reservations', icon: '🔖' },
    { key: 'renewalLimit', label: 'Max Renewals', icon: '🔄' },
    { key: 'issueDuration', label: 'Issue Duration (days)', icon: '📅' },
    { key: 'finePerDay', label: 'Fine Per Day (₹)', icon: '💰' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Policy</h2>
            <p className="text-sm text-gray-500">{plan.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {fields.map(f => (
            <div key={f.key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {f.icon} {f.label}
              </label>
              <input
                type="number"
                name={f.key}
                value={form[f.key]}
                onChange={handleChange}
                min={0}
                className="w-24 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Policies = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState(null);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/v1/borrowing-limits/policies');
      if (res.data.success) setPlans(res.data.data);
    } catch (err) {
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleSave = (updated) => {
    setPlans(prev => prev.map(p => p._id === updated._id ? updated : p));
    setEditPlan(null);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">📋</span> Borrowing Policies
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Manage limits for each membership tier. Changes apply immediately to all future transactions.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded mt-1 inline-block ${PLAN_COLORS[plan.planType] || PLAN_COLORS.STUDENT}`}>
                      {plan.planType}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${plan.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {plan.status}
                  </span>
                </div>

                <div className="p-5 flex-1 space-y-3">
                  {[
                    { label: 'Max Books', value: plan.borrowLimit, icon: '📚' },
                    { label: 'Max Reservations', value: plan.reservationLimit, icon: '🔖' },
                    { label: 'Max Renewals', value: plan.renewalLimit, icon: '🔄' },
                    { label: 'Issue Duration', value: `${plan.issueDuration} days`, icon: '📅' },
                    { label: 'Fine Per Day', value: `₹${plan.finePerDay}`, icon: '💰' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{item.icon} {item.label}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => setEditPlan(plan)}
                    className="w-full py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                  >
                    ✏️ Edit Policy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editPlan && (
        <EditPlanModal
          plan={editPlan}
          onClose={() => setEditPlan(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Policies;
