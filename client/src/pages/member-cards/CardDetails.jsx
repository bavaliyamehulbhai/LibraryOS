import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/v1/member-cards/${id}`);
      if (res.data.success) {
        setCard(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load card details');
      navigate('/member-cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCard();
  }, [id]);

  const handlePrint = async () => {
    try {
      setActionLoading(true);
      const res = await api.get(`/v1/member-cards/${id}/print`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MemberCard_${card.cardNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportLost = async () => {
    if (!window.confirm("Are you sure you want to mark this card as LOST? The member will be blocked from borrowing until a new card is issued.")) return;
    try {
      setActionLoading(true);
      const res = await api.put(`/v1/member-cards/${id}/lost`);
      if (res.data.success) {
        toast.success('Card marked as lost');
        fetchCard();
      }
    } catch (error) {
      toast.error('Failed to update card status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplace = async () => {
    if (!window.confirm("Generate a replacement card? This current card will be permanently deactivated.")) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/v1/member-cards/${id}/replace`);
      if (res.data.success) {
        toast.success('Replacement card generated');
        navigate(`/member-cards/${res.data.data._id}`);
      }
    } catch (error) {
      toast.error('Failed to replace card');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !card) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  const isExpired = new Date() > new Date(card.expiryDate);
  const displayStatus = isExpired && card.status === 'ACTIVE' ? 'EXPIRED' : card.status;
  const planName = card.memberId?.membershipPlanId?.name || 'N/A';

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link to="/member-cards" className="text-sm text-blue-600 hover:underline mb-2 inline-block">← Back to Cards</Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              Card: {card.cardNumber}
              <span className={`ml-4 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${
                displayStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                displayStatus === 'EXPIRED' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {displayStatus}
              </span>
            </h1>
          </div>
          <div className="flex space-x-3">
            {displayStatus === 'ACTIVE' && (
              <button onClick={handleReportLost} disabled={actionLoading} className="px-4 py-2 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition font-medium text-sm">
                Mark Lost
              </button>
            )}
            {(displayStatus === 'LOST' || displayStatus === 'EXPIRED') && (
              <button onClick={handleReplace} disabled={actionLoading} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition font-medium text-sm shadow-sm">
                Issue Replacement
              </button>
            )}
            <button onClick={handlePrint} disabled={actionLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm shadow-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Print PDF
            </button>
          </div>
        </div>

        {/* Digital Card Preview */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden" style={{ width: '486px', height: '306px' }}>
            {/* Header Ribbon */}
            <div className="bg-blue-600 h-16 px-6 flex items-center justify-between">
              <span className="text-white font-bold text-xl tracking-wider">LibraryOS</span>
              <span className="text-blue-100 text-sm font-medium">MEMBER ID</span>
            </div>
            
            <div className="p-6 flex h-[242px]">
              {/* Photo Area */}
              <div className="w-32 mr-6 flex flex-col items-center">
                {card.memberId?.profileImage && card.memberId.profileImage !== 'default-avatar.png' ? (
                  <img src={card.memberId.profileImage} alt="" className="w-32 h-40 object-cover rounded shadow-sm border border-gray-200 bg-gray-100" />
                ) : (
                  <div className="w-32 h-40 bg-gray-100 border border-gray-200 rounded shadow-sm flex items-center justify-center text-gray-400 font-medium">
                    PHOTO
                  </div>
                )}
                <div className="mt-4">
                  {card.qrCode && <img src={card.qrCode} alt="QR" className="w-20 h-20 mx-auto" />}
                </div>
              </div>

              {/* Details Area */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight uppercase">
                    {card.memberId?.firstName} {card.memberId?.lastName}
                  </h2>
                  <p className="text-gray-500 font-medium text-sm mt-1">{planName}</p>
                </div>
                
                <div className="space-y-1 mb-2 text-sm text-gray-800">
                  <p><span className="font-medium text-gray-500 inline-block w-16">ID:</span> {card.memberId?.memberCode}</p>
                  <p><span className="font-medium text-gray-500 inline-block w-16">Issued:</span> {new Date(card.issueDate).toLocaleDateString()}</p>
                  <p><span className="font-medium text-gray-500 inline-block w-16">Expires:</span> <span className={isExpired ? 'text-red-600 font-bold' : ''}>{new Date(card.expiryDate).toLocaleDateString()}</span></p>
                </div>
                
                <div className="mt-2 text-center">
                  {card.barcode && <img src={card.barcode} alt="Barcode" className="h-10 mx-auto object-contain w-full" />}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CardDetails;
