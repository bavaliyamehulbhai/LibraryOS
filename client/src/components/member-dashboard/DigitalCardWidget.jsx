import React, { useState } from 'react';

const DigitalCardWidget = ({ card, profile }) => {
  const [showModal, setShowModal] = useState(false);

  if (!card) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🪪</span>
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">No Active Card</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Please visit the library desk to get your digital ID card issued.</p>
      </div>
    );
  }

  const isExpired = new Date() > new Date(card.expiryDate);

  return (
    <>
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg border border-blue-500 overflow-hidden h-full flex flex-col">
        <div className="p-4 border-b border-blue-500/50 flex justify-between items-center">
          <h3 className="font-bold text-white tracking-wider uppercase text-sm">Digital ID Card</h3>
          <span className={`px-2 py-1 text-xs font-bold rounded ${isExpired ? 'bg-red-500 text-white' : 'bg-green-400 text-green-900'}`}>
            {isExpired ? 'EXPIRED' : card.status}
          </span>
        </div>
        
        <div className="p-6 flex-1 flex flex-col items-center justify-center relative">
          {/* Background watermark */}
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 18.5l-9.5-4.75v-5L12 15.5l9.5-4.75v5L12 20.5z"/></svg>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm mb-4 relative z-10">
            {card.qrCode ? (
              <img src={card.qrCode} alt="QR Code" className="w-28 h-28" />
            ) : (
              <div className="w-28 h-28 bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center">QR Missing</div>
            )}
          </div>
          
          <p className="text-blue-100 font-mono text-sm tracking-widest mb-1">{card.cardNumber}</p>
          <p className="text-white font-bold text-lg uppercase">{profile?.name}</p>
        </div>

        <div className="bg-blue-900/40 p-4 text-center">
          <button 
            onClick={() => setShowModal(true)}
            className="text-white text-sm font-medium hover:text-blue-200 transition"
          >
            View Full Card
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 flex flex-col items-center text-center relative">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <h2 className="text-white font-bold text-xl uppercase tracking-widest mb-6">Library ID</h2>
              <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
                {card.qrCode ? (
                  <img src={card.qrCode} alt="QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-400">No QR Code</div>
                )}
              </div>
              <p className="text-white font-bold text-2xl uppercase mb-1">{profile?.name}</p>
              <p className="text-blue-200 font-mono text-lg tracking-widest mb-4">{card.cardNumber}</p>
              <div className="flex gap-4 text-center text-blue-100 text-sm w-full justify-center">
                <div>
                  <div className="opacity-70 text-xs">Issued</div>
                  <div className="font-medium">{new Date(card.issueDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="opacity-70 text-xs">Expires</div>
                  <div className="font-medium">{new Date(card.expiryDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Present this QR code at the checkout desk</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DigitalCardWidget;
