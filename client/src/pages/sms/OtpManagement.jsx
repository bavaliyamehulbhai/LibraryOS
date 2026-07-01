import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const OtpManagement = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = Send, 2 = Verify

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/v1/sms/otp/send', { phone, context: 'LOGIN' });
      toast.success('OTP sent successfully (Check server logs if using MOCK)');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/v1/sms/otp/verify', { phone, otp, context: 'LOGIN' });
      toast.success('OTP Verified Successfully! ✅');
      setStep(1);
      setOtp('');
      setPhone('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔐 OTP Tester
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Test the LibraryOS SMS OTP verification flow.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            <div className={`flex-1 text-center py-4 font-bold text-sm ${step === 1 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>
              1. Request OTP
            </div>
            <div className={`flex-1 text-center py-4 font-bold text-sm ${step === 2 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>
              2. Verify OTP
            </div>
          </div>

          <div className="p-8">
            {step === 1 ? (
              <form onSubmit={handleSendOtp}>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !phone}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="mb-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enter the 6-digit code sent to</p>
                  <p className="font-bold text-gray-900 dark:text-white font-mono">{phone}</p>
                </div>
                <div className="mb-6">
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center tracking-[1em] px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-2xl"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold shadow-sm disabled:opacity-50 mb-4"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-bold"
                >
                  Back to request
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm border border-blue-100 dark:border-blue-800/50">
          <strong>How it works:</strong> The OTP is generated with a 5-minute TTL. The SMS is dispatched to the background queue, which forwards it to Twilio or the Mock provider.
        </div>
      </div>
    </div>
  );
};

export default OtpManagement;
