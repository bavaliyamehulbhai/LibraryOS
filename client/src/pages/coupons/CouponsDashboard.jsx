import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Tag, Trash2, Plus } from 'lucide-react';

const CouponsDashboard = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    couponCode: '', title: '', discountType: 'PERCENTAGE', discountValue: 0, startDate: '', endDate: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/coupons/${id}`);
      if (res.data.success) {
        toast.success("Coupon deleted");
        fetchCoupons();
      }
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/coupons', formData);
      if (res.data.success) {
        toast.success("Coupon created successfully");
        setShowModal(false);
        fetchCoupons();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Coupon Engine...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketing Campaigns</h1>
          <p className="text-gray-500">Manage promotional coupons and trial recovery codes.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" /> New Coupon
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Tag className="w-5 h-5 text-indigo-500 mr-2" />
                    <span className="font-bold text-gray-900 dark:text-white">{coupon.couponCode}</span>
                  </div>
                  <div className="text-sm text-gray-500">{coupon.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `Rs. ${coupon.discountValue}`} Off
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {coupon.usedCount} / {coupon.usageLimit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(coupon.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${coupon.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {coupon.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button onClick={() => handleDelete(coupon._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Coupon</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                <input required type="text" className="w-full border rounded-lg p-2 dark:bg-gray-700 uppercase" placeholder="e.g. SAVE20" value={formData.couponCode} onChange={e => setFormData({...formData, couponCode: e.target.value.toUpperCase()})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Title</label>
                <input required type="text" className="w-full border rounded-lg p-2 dark:bg-gray-700" placeholder="e.g. Summer Sale" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full border rounded-lg p-2 dark:bg-gray-700" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (Rs.)</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <input required type="number" className="w-full border rounded-lg p-2 dark:bg-gray-700" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} />
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input required type="date" className="w-full border rounded-lg p-2 dark:bg-gray-700" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input required type="date" className="w-full border rounded-lg p-2 dark:bg-gray-700" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">Create Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsDashboard;
