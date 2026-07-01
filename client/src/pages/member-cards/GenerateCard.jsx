import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GenerateCard = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get('/v1/members?limit=100'); // Or a searchable dropdown in real app
        if (res.data.success) {
          setMembers(res.data.data || []);
        }
      } catch (error) {
        toast.error('Failed to load members');
      } finally {
        setFetching(false);
      }
    };
    fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember) {
      toast.error('Please select a member');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/v1/member-cards', { memberId: selectedMember });
      if (res.data.success) {
        toast.success('ID Card generated successfully!');
        navigate(`/member-cards/${res.data.data._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Generate ID Card</h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Issue a new smart ID card with barcode and QR for a member.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          {fetching ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Member *</label>
                <select 
                  required 
                  value={selectedMember} 
                  onChange={(e) => setSelectedMember(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="">-- Choose a member --</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.firstName} {m.lastName} ({m.memberCode})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Note: Generating a new card will automatically expire any active cards this member currently holds.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-4">
                <button type="button" onClick={() => navigate('/member-cards')} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={loading || !selectedMember} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center">
                  {loading ? 'Generating...' : 'Generate Card'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateCard;
