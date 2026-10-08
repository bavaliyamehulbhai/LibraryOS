import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  User, BookOpen, Search, ArrowRight, CheckCircle2, 
  Barcode, QrCode, AlertCircle 
} from 'lucide-react';
import { APP_VERSION } from '../../constants/version';

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
        const exactMember = res.data.data.find(m => m.memberCode === memberCode || m.memberCardNumber === memberCode) || res.data.data[0];
        setMember(exactMember);
        toast.success("Member profile loaded");
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
      const res = await api.get(`/v1/inventory/copies/barcode/${copyBarcode}`);
      if (res.data.success) {
        setBookCopy(res.data.data);
        toast.success("Book copy verified");
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
        toast.success("Book successfully issued to patron!");
        navigate(`/issues/${res.data.data._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue book');
    } finally {
      setIssueLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Circulation Operation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Checkout & Issue Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Scan patron member ID card and copy barcode to process fast book circulation.
          </p>
        </div>
      </div>

      {/* Main Dual Step Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Step 1: Member Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Identify Patron
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Step 1 of 2
              </span>
            </div>

            <form onSubmit={handleMemberSearch} className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Scan Member Card Barcode or enter code..." 
                  value={memberCode}
                  onChange={(e) => setMemberCode(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 disabled:opacity-50 transition active:scale-95"
              >
                Scan
              </button>
            </form>

            {member ? (
              <div className="p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/40 dark:to-purple-950/20">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-600/20">
                    {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      Code: {member.memberCode}
                    </p>
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      member.status === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400'
                    }`}>
                      {member.status || "ACTIVE"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                Ready for patron scan. Type member code and press Scan.
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Book Copy */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Verify Physical Copy
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Step 2 of 2
              </span>
            </div>

            <form onSubmit={handleCopySearch} className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Scan Book Copy Barcode..." 
                  value={copyBarcode}
                  onChange={(e) => setCopyBarcode(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 disabled:opacity-50 transition active:scale-95"
              >
                Verify
              </button>
            </form>

            {bookCopy ? (
              <div className="p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/40 dark:to-purple-950/20">
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                    {bookCopy.bookId?.coverImage ? (
                      <img src={bookCopy.bookId.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <BookOpen size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {bookCopy.bookId?.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      Barcode: {bookCopy.barcode}
                    </p>
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      bookCopy.status === 'AVAILABLE' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-400' 
                        : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400'
                    }`}>
                      {bookCopy.status || "AVAILABLE"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                Waiting for book barcode scan.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation & Final Issue Action Bar */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className={`w-5 h-5 ${member && bookCopy ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {member && bookCopy 
              ? `Ready to issue "${bookCopy.bookId?.title}" to ${member.firstName} ${member.lastName}` 
              : "Scan both patron and book copy above to enable checkout"}
          </span>
        </div>

        <button 
          onClick={handleIssue}
          disabled={issueLoading || !member || !bookCopy}
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 active:scale-95"
        >
          {issueLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Processing Loan...</span>
            </>
          ) : (
            <>
              <span>Confirm & Issue Book</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default IssueBook;

