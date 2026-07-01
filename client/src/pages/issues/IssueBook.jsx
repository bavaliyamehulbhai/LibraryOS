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
      if (res.data.success && res.data.data.members.length > 0) {
        // Find exact match
        const exactMember = res.data.data.members.find(m => m.memberCode === memberCode || m.memberCardNumber === memberCode);
        if (exactMember) {
          setMember(exactMember);
          toast.success("Member loaded successfully");
        } else {
          toast.error("Member not found with this code.");
          setMember(null);
        }
      } else {
        toast.error("Member not found.");
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
        copyId: bookCopy._id
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
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">📖</span> Issue Book
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Scan member card and book barcode to process checkout.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Member Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">1. Member Details</h2>
            <form onSubmit={handleMemberSearch} className="mb-6 flex gap-2">
              <input 
                type="text" 
                placeholder="Scan Member ID or Card Barcode..." 
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <button type="submit" disabled={loading} className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-50">
                Find
              </button>
            </form>

            {member ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xl font-bold text-blue-700 dark:text-blue-300">
                    {member.firstName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{member.firstName} {member.lastName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.memberCode}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                Waiting for member scan...
              </div>
            )}
          </div>

          {/* Book Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">2. Book Details</h2>
            <form onSubmit={handleCopySearch} className="mb-6 flex gap-2">
              <input 
                type="text" 
                placeholder="Scan Book Copy Barcode..." 
                value={copyBarcode}
                onChange={(e) => setCopyBarcode(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <button type="submit" disabled={loading} className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-50">
                Find
              </button>
            </form>

            {bookCopy ? (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded shadow-sm overflow-hidden flex-shrink-0">
                    {bookCopy.bookId?.coverImage ? (
                      <img src={bookCopy.bookId.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">📘</div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{bookCopy.bookId?.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Barcode: <span className="font-mono">{bookCopy.barcode}</span></p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      bookCopy.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {bookCopy.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                Waiting for book scan...
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-end items-center">
          <button 
            onClick={handleIssue}
            disabled={issueLoading || !member || !bookCopy}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-sm flex items-center"
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
