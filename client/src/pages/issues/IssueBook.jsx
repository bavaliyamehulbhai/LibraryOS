import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const IssueBook = () => {
  const navigate = useNavigate();
  const [memberCode, setMemberCode] = useState('');
  const [copyBarcode, setCopyBarcode] = useState('');
  
  const [member, setMember] = useState(null);
  const [bookCopy, setBookCopy] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);

  const handleMemberSearch = async (e) => {
    e.preventDefault();
    if (!memberCode) return;
    setLoading(true);
    try {
      const res = await api.get(`/v1/members?search=${memberCode}`);
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        // Find exact match by memberCode or show the first match
        const exactMember = res.data.data.find(m => m.memberCode === memberCode || m.memberCardNumber === memberCode) || res.data.data[0];
        setMember(exactMember);
        toast.success("Member loaded successfully");
      } else {
        toast.error("Member not found with this code.");
        setMember(null);
      }
    } catch (error) {
      toast.error('Failed to load member');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySearch = async (e) => {
    e.preventDefault();
    if (!copyBarcode) return;
    setLoading(true);
    try {
      // In a real app, you might have a dedicated endpoint for searching copies by barcode.
      // Here we assume `/v1/inventory/copies?barcode=XYZ` or similar. Let's assume a mock fetch or we just set it.
      // For now, let's just make a dummy request to check if it's available.
      // We will actually just pass copyId to the issue endpoint. But we need copyId.
      const res = await api.get(`/v1/inventory/copies/barcode/${copyBarcode}`);
      if (res.data.success) {
        setBookCopy(res.data.data);
        toast.success("Book copy loaded");
      }
    } catch (error) {
      toast.error('Failed to load book copy. Ensure barcode is correct.');
      setBookCopy(null);
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async () => {
    if (!member || !bookCopy) {
      toast.error("Please load both a member and a book copy first.");
      return;
    }
    
    setIssueLoading(true);
    try {
      const res = await api.post('/v1/issues', {
        memberId: member._id,
        bookCopyId: bookCopy._id
      });
      
      if (res.data.success) {
        toast.success("Book issued successfully!");
        navigate(`/issues/${res.data.data._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue book');
    } finally {
      setIssueLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">📖</span> Issue Book
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Scan member card and book barcode to process checkout.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
          {/* Member Section */}
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 p-8 hover:shadow-xl transition-all">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-100 pb-4 dark:border-gray-700 flex items-center gap-2">
              <span className="text-2xl">👤</span> 1. Member Details
            </h2>
            <form onSubmit={handleMemberSearch} className="mb-6 flex gap-2">
              <input 
                type="text" 
                placeholder="Scan Member ID or Card Barcode..." 
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                className="flex-1 px-5 py-3 border border-white/50 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-inner transition-all"
                required
              />
              <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white rounded-xl hover:from-black hover:to-gray-900 transition-all shadow-md font-bold disabled:opacity-50 hover:-translate-y-0.5">
                Find
              </button>
            </form>

            {member ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm animate-fade-in-up">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800 rounded-full flex items-center justify-center text-3xl font-black text-blue-700 dark:text-blue-300 shadow-inner">
                    {member.firstName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-gray-900 dark:text-white">{member.firstName} {member.lastName}</h3>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">{member.memberCode}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm ${
                      member.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 font-medium text-gray-400 bg-white/30 dark:bg-gray-800/30 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                Waiting for member scan...
              </div>
            )}
          </div>

          {/* Book Section */}
          <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 p-8 hover:shadow-xl transition-all">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-100 pb-4 dark:border-gray-700 flex items-center gap-2">
              <span className="text-2xl">📚</span> 2. Book Details
            </h2>
            <form onSubmit={handleCopySearch} className="mb-6 flex gap-2">
              <input 
                type="text" 
                placeholder="Scan Book Copy Barcode..." 
                value={copyBarcode}
                onChange={(e) => setCopyBarcode(e.target.value)}
                className="flex-1 px-5 py-3 border border-white/50 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-inner transition-all"
                required
              />
              <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white rounded-xl hover:from-black hover:to-gray-900 transition-all shadow-md font-bold disabled:opacity-50 hover:-translate-y-0.5">
                Find
              </button>
            </form>

            {bookCopy ? (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm animate-fade-in-up">
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-600">
                    {bookCopy.bookId?.coverImage ? (
                      <img src={bookCopy.bookId.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">📘</div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight">{bookCopy.bookId?.title}</h3>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2 bg-white/50 dark:bg-gray-800/50 inline-block px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700">Barcode: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{bookCopy.barcode}</span></p>
                    <div className="mt-3">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm ${
                        bookCopy.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                      {bookCopy.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 font-medium text-gray-400 bg-white/30 dark:bg-gray-800/30 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                Waiting for book scan...
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white/80 backdrop-blur-xl dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700 flex justify-end items-center relative z-10">
          <button 
            onClick={handleIssue}
            disabled={issueLoading || !member || !bookCopy}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:grayscale shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center"
          >
            {issueLoading ? (
              <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div> Processing...</>
            ) : (
              <>Confirm Issue ➔</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default IssueBook;
