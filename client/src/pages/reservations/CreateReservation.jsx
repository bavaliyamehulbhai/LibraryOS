import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateReservation = () => {
  const navigate = useNavigate();
  const [memberCode, setMemberCode] = useState('');
  const [bookTitleQuery, setBookTitleQuery] = useState('');
  
  const [member, setMember] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  
  const [loadingMember, setLoadingMember] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleMemberSearch = async (e) => {
    e.preventDefault();
    if (!memberCode) return;
    setLoadingMember(true);
    try {
      const res = await api.get(`/v1/members?search=${memberCode}`);
      if (res.data.success && res.data.data.members.length > 0) {
        const exactMember = res.data.data.members.find(m => m.memberCode === memberCode || m.memberCardNumber === memberCode);
        if (exactMember) {
          setMember(exactMember);
          toast.success("Member loaded");
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
      setLoadingMember(false);
    }
  };

  const handleBookSearch = async (e) => {
    e.preventDefault();
    if (!bookTitleQuery) return;
    setLoadingBooks(true);
    try {
      const res = await api.get(`/v1/books?search=${bookTitleQuery}`);
      if (res.data.success) {
        setBooks(res.data.data.books || res.data.data); // depending on how /books is paginated
      }
    } catch (error) {
      toast.error('Failed to search books');
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleReserve = async () => {
    if (!member || !selectedBook) {
      toast.error("Please select a member and a book.");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await api.post('/v1/reservations', {
        memberId: member._id,
        bookId: selectedBook._id
      });
      
      if (res.data.success) {
        toast.success(`Reservation created! Queue Position: #${res.data.data.queuePosition}`);
        navigate('/reservations');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reserve book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">🔖</span> Create Hold / Reservation
          </h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Place a member in the waiting queue for an unavailable book.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Member Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">1. Select Member</h2>
            <form onSubmit={handleMemberSearch} className="mb-6 flex gap-2">
              <input 
                type="text" 
                placeholder="Scan Member ID..." 
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <button type="submit" disabled={loadingMember} className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-50">
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
                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold uppercase tracking-wider">
                      {member.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                Waiting for member selection...
              </div>
            )}
          </div>

          {/* Book Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">2. Select Book</h2>
            <form onSubmit={handleBookSearch} className="mb-6 flex gap-2">
              <input 
                type="text" 
                placeholder="Search Book Title or ISBN..." 
                value={bookTitleQuery}
                onChange={(e) => setBookTitleQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <button type="submit" disabled={loadingBooks} className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-50">
                Search
              </button>
            </form>

            {selectedBook ? (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800 relative">
                <button 
                  onClick={() => setSelectedBook(null)}
                  className="absolute top-2 right-2 text-indigo-400 hover:text-indigo-600 transition"
                >
                  ✕
                </button>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded shadow-sm overflow-hidden flex-shrink-0">
                    {selectedBook.coverImage ? (
                      <img src={selectedBook.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">📘</div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{selectedBook.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Available Copies: {selectedBook.availableCopies}</p>
                    {selectedBook.availableCopies > 0 && (
                      <p className="text-xs text-red-500 font-bold mt-1">This book is available. Reserve not needed.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto min-h-[150px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-2">
                {books.length > 0 ? (
                  <div className="space-y-2">
                    {books.map(b => (
                      <div 
                        key={b._id} 
                        onClick={() => setSelectedBook(b)}
                        className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center transition"
                      >
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{b.title}</p>
                          <p className="text-xs text-gray-500">Avail: {b.availableCopies} / {b.totalCopies}</p>
                        </div>
                        <span className="text-blue-500 text-xs font-bold">Select</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    Search results will appear here.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-end items-center">
          <button 
            onClick={handleReserve}
            disabled={submitting || !member || !selectedBook}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-sm flex items-center"
          >
            {submitting ? (
              <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div> Processing...</>
            ) : (
              <>Place Hold ➔</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateReservation;
