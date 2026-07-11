import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { confirmAlert } from '../../utils/confirmAlert';

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
    if (!(await confirmAlert("Are you sure you want to mark this card as LOST? The member will be blocked from borrowing until a new card is issued."))) return;
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
    if (!(await confirmAlert("Generate a replacement card? This current card will be permanently deactivated."))) return;
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

  const qrDataText = `Library: ${card.libraryId?.name || 'LibraryOS'}
Member: ${card.memberId?.firstName} ${card.memberId?.lastName}
ID: ${card.memberId?.memberCode}
Card: ${card.cardNumber}
Plan: ${planName}
Expires: ${new Date(card.expiryDate).toLocaleDateString()}`;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link to="/member-cards" className="text-sm text-blue-600 hover:underline mb-2 inline-block">← Back to Cards</Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              Card: {card.cardNumber}
              <span className={`ml-4 text-xs px-3 py-1.5 rounded-lg font-black uppercase tracking-wider shadow-sm border ${
                displayStatus === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:border-green-700/50 dark:text-green-400' :
                displayStatus === 'EXPIRED' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/50 dark:text-yellow-400' :
                'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-400'
              }`}>
                {displayStatus}
              </span>
            </h1>
          </div>
          <div className="flex space-x-3">
            {displayStatus === 'ACTIVE' && (
              <button onClick={handleReportLost} disabled={actionLoading} className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 rounded-xl transition-all font-bold text-sm shadow-sm hover:shadow-md">
                Mark Lost
              </button>
            )}
            {(displayStatus === 'LOST' || displayStatus === 'EXPIRED') && (
              <button onClick={handleReplace} disabled={actionLoading} className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-xl transition-all font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5">
                Issue Replacement
              </button>
            )}
            <button onClick={handlePrint} disabled={actionLoading} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Print PDF
            </button>
          </div>
        </div>

        {/* Digital Card Preview */}
        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-blue-900/10 dark:shadow-black/40 border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all hover:scale-105 duration-300" style={{ width: '486px', height: '306px' }}>
            {/* Header Ribbon */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-16 px-6 flex items-center justify-between">
              <span className="text-white font-black text-xl tracking-wider">LibraryOS</span>
              <span className="text-blue-100/80 text-xs font-bold tracking-widest">MEMBER ID</span>
            </div>
            
            <div className="p-6 flex h-[242px]">
              {/* Photo Area */}
              <div className="w-32 mr-6 flex flex-col items-center">
                {card.memberId?.profileImage && card.memberId.profileImage !== 'default-avatar.png' ? (
                  <img src={card.memberId.profileImage} alt="" className="w-32 h-40 object-cover rounded-xl shadow-md border-2 border-white dark:border-gray-700 bg-gray-100" />
                ) : (
                  <div className="w-32 h-40 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 border-2 border-white dark:border-gray-700 rounded-xl shadow-md flex items-center justify-center">
                    <span className="text-5xl font-black text-blue-500/50 dark:text-gray-400/50">
                      {card.memberId?.firstName?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                <div className="mt-4 w-20 h-20">
                  {card.cardNumber ? (
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrDataText)}`} alt="QR" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white p-1 rounded" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-500">
                      <span className="text-[10px] text-gray-400 font-bold">NO QR</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Area */}
              <div className="flex-1 flex flex-col justify-between pt-1">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight uppercase tracking-wide">
                    {card.memberId?.firstName} {card.memberId?.lastName}
                  </h2>
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xs mt-1 uppercase tracking-wider">{planName}</p>
                </div>
                
                <div className="space-y-1.5 mb-2 text-xs text-gray-800 dark:text-gray-300">
                  <p><span className="font-bold text-gray-400 dark:text-gray-500 inline-block w-16 uppercase">ID:</span> <span className="font-mono font-medium">{card.memberId?.memberCode}</span></p>
                  <p><span className="font-bold text-gray-400 dark:text-gray-500 inline-block w-16 uppercase">Issued:</span> <span className="font-medium">{new Date(card.issueDate).toLocaleDateString()}</span></p>
                  <p><span className="font-bold text-gray-400 dark:text-gray-500 inline-block w-16 uppercase">Expires:</span> <span className={`font-medium ${isExpired ? 'text-red-500 font-bold' : ''}`}>{new Date(card.expiryDate).toLocaleDateString()}</span></p>
                </div>
                
                <div className="mt-2 text-center h-10 w-full flex items-end justify-center">
                  {card.cardNumber ? (
                    <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${card.cardNumber}&scale=3&includetext=false`} alt="Barcode" className="h-10 mx-auto object-contain w-full mix-blend-multiply dark:mix-blend-normal dark:bg-white px-2 py-1 rounded" />
                  ) : (
                    <div className="h-6 w-3/4 bg-gray-100 dark:bg-gray-700 rounded mx-auto flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-500">
                      <span className="text-[10px] text-gray-400 font-bold">NO BARCODE DATA</span>
                    </div>
                  )}
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
