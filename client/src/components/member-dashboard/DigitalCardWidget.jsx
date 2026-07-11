import React, { useState } from 'react';
import { QrCode, X } from 'lucide-react';

const DigitalCardWidget = ({ card, profile, plan }) => {
  const [showModal, setShowModal] = useState(false);

  if (!card) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4 border border-gray-100 dark:border-gray-600">
          <QrCode className="text-gray-400" size={32} />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">No Active Card</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Please visit the library desk to get your digital ID card issued.</p>
      </div>
    );
  }

  const isExpired = new Date() > new Date(card.expiryDate);

  const qrDataText = `Library: LibraryOS
Member: ${profile?.name}
ID: ${profile?.memberCode || 'N/A'}
Card: ${card?.cardNumber}
Plan: ${plan?.name || 'N/A'}
Expires: ${new Date(card.expiryDate).toLocaleDateString()}`;

  return (
    <>
      <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 rounded-2xl shadow-xl overflow-hidden h-full flex flex-col group border border-blue-700/50 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300">
        
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-400/30 transition-all duration-500"></div>

        <div className="p-5 border-b border-white/10 flex justify-between items-center relative z-10">
          <h3 className="font-black text-white/90 tracking-widest uppercase text-xs flex items-center">
            Library ID Card
          </h3>
          <span className={`px-2 py-1 text-[10px] font-black tracking-wider uppercase rounded-md backdrop-blur-md ${isExpired ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
            {isExpired ? 'EXPIRED' : card.status}
          </span>
        </div>
        
        <div className="p-6 flex-1 flex flex-col items-center justify-center relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-inner mb-5 border border-white/20">
            <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg p-1">
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrDataText)}`} alt="QR" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <p className="text-blue-200/80 font-mono text-sm tracking-[0.2em] mb-2">{card.cardNumber}</p>
          <p className="text-white font-bold text-xl uppercase tracking-wider">{profile?.name}</p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="bg-black/20 hover:bg-black/40 p-4 text-center text-white/80 text-sm font-bold uppercase tracking-wider transition-colors relative z-10 backdrop-blur-md"
        >
          View Full Card
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => setShowModal(false)}>
          <div className="bg-transparent max-w-2xl w-full transform transition-all flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <div className="w-full max-w-[486px] flex justify-end mb-4">
              <button onClick={() => setShowModal(false)} className="text-white hover:text-red-400 transition-colors p-2 bg-black/40 rounded-full backdrop-blur-md">
                <X size={24} />
              </button>
            </div>
            
            {/* The beautiful card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-blue-900/40 dark:shadow-black/60 border border-gray-100 dark:border-gray-700 overflow-hidden" style={{ width: '100%', maxWidth: '486px', height: '306px' }}>
              {/* Header Ribbon */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-16 px-6 flex items-center justify-between">
                <span className="text-white font-black text-xl tracking-wider">LibraryOS</span>
                <span className="text-blue-100/80 text-xs font-bold tracking-widest">MEMBER ID</span>
              </div>
              
              <div className="p-6 flex h-[242px]">
                {/* Photo Area */}
                <div className="w-32 mr-6 flex flex-col items-center">
                  <div className="w-32 h-40 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 border-2 border-white dark:border-gray-700 rounded-xl shadow-md flex items-center justify-center">
                    <span className="text-5xl font-black text-blue-500/50 dark:text-gray-400/50">
                      {profile?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="mt-4 w-20 h-20">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrDataText)}`} alt="QR" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white p-1 rounded" />
                  </div>
                </div>

                {/* Details Area */}
                <div className="flex-1 flex flex-col justify-between pt-1">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight uppercase tracking-wide">
                      {profile?.name}
                    </h2>
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xs mt-1 uppercase tracking-wider line-clamp-1">{plan?.name || 'N/A'}</p>
                  </div>
                  
                  <div className="space-y-1.5 mb-2 text-xs text-gray-800 dark:text-gray-300">
                    <p><span className="font-bold text-gray-400 dark:text-gray-500 inline-block w-16 uppercase">ID:</span> <span className="font-mono font-medium">{profile?.memberCode || 'N/A'}</span></p>
                    <p><span className="font-bold text-gray-400 dark:text-gray-500 inline-block w-16 uppercase">Issued:</span> <span className="font-medium">{new Date(card.issueDate).toLocaleDateString()}</span></p>
                    <p><span className="font-bold text-gray-400 dark:text-gray-500 inline-block w-16 uppercase">Expires:</span> <span className={`font-medium ${isExpired ? 'text-red-500 font-bold' : ''}`}>{new Date(card.expiryDate).toLocaleDateString()}</span></p>
                  </div>
                  
                  <div className="mt-2 text-center h-10 w-full flex items-end justify-center">
                    <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${card.cardNumber}&scale=3&includetext=false`} alt="Barcode" className="h-10 mx-auto object-contain w-full mix-blend-multiply dark:mix-blend-normal dark:bg-white px-2 py-1 rounded" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-sm font-bold uppercase tracking-wider text-white/70">Present this card at the library desk</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DigitalCardWidget;
