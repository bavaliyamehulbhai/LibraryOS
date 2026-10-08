import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  UserPlus, ArrowLeft, CreditCard, Sparkles, 
  Check, Phone, Mail, User, Shield, Layers, 
  Calendar, CheckCircle2, AlertCircle, BookOpen
} from 'lucide-react';
import { APP_VERSION } from '../../constants/version';

const MEMBER_TYPES = [
  { id: 'STUDENT', label: 'Student', icon: '🎓', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  { id: 'TEACHER', label: 'Teacher', icon: '👨‍🏫', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'FACULTY', label: 'Faculty', icon: '🏛️', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { id: 'GUEST', label: 'Guest', icon: '🏷️', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { id: 'EXTERNAL', label: 'External', icon: '🌐', badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' }
];

const CreateMember = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    memberType: 'STUDENT',
    membershipPlanId: ''
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/v1/membership-plans');
        if (res.data.success && Array.isArray(res.data.data)) {
          setPlans(res.data.data);
          if (res.data.data.length > 0) {
            setFormData(prev => ({ ...prev, membershipPlanId: res.data.data[0]._id }));
          }
        }
      } catch (error) {
        console.error('Failed to load membership plans', error);
      }
    };
    fetchPlans();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectedPlan = plans.find(p => p._id === formData.membershipPlanId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First and Last names are required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Valid email address is required');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.membershipPlanId) delete payload.membershipPlanId;
      
      const res = await api.post('/v1/members', payload);
      if (res.data.success) {
        toast.success(`Patron ${formData.firstName} registered successfully!`);
        navigate('/members');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register member');
    } finally {
      setLoading(false);
    }
  };

  const initials = `${formData.firstName?.[0] || 'J'}${formData.lastName?.[0] || 'D'}`.toUpperCase();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link 
              to="/members" 
              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition"
            >
              <ArrowLeft size={14} className="mr-1" />
              Back to Patrons
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Patron Enrollment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <UserPlus className="text-indigo-600 dark:text-indigo-400" size={28} />
            Register New Patron
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Create institutional patron credentials, assign borrowing privileges, and generate digital membership cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/members"
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Complete Registration</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Form + Live ID Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Panel (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Identity Information Section */}
            <div className="glass-card p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Patron Identity & Bio</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Institutional names and contact details</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. Rahul"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g. Sharma"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="rahul.sharma@example.edu"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other / Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Patron Classification <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="memberType"
                    value={formData.memberType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    {MEMBER_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Select Type Chips */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                  Quick Classification Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {MEMBER_TYPES.map(type => {
                    const isSelected = formData.memberType === type.id;
                    return (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setFormData({ ...formData, memberType: type.id })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/25'
                            : 'bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Membership Plan Section */}
            <div className="glass-card p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Borrowing Quota & Privileges</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Select an institutional membership tier</p>
                  </div>
                </div>
                {selectedPlan && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Max: {selectedPlan.maxBooksAllowed} Books / {selectedPlan.maxDaysAllowed} Days
                  </span>
                )}
              </div>

              {plans.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>No membership plans configured yet. Member will be created without borrowing limit defaults.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {plans.map(plan => {
                    const isSelected = formData.membershipPlanId === plan._id;
                    return (
                      <div
                        key={plan._id}
                        onClick={() => setFormData({ ...formData, membershipPlanId: plan._id })}
                        className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                          isSelected
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-950/40 dark:hover:bg-slate-900/50 border-slate-200/80 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                          {isSelected && (
                            <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <div className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <div className="flex justify-between">
                            <span>Max Books:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{plan.maxBooksAllowed} books</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Loan Period:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{plan.maxDaysAllowed} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Overdue Rate:</span>
                            <span className="font-semibold text-rose-600 dark:text-rose-400">₹{plan.finePerDay}/day</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/members')}
                className="px-5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                {loading ? 'Registering Patron...' : 'Enroll Patron Now'}
              </button>
            </div>
          </form>
        </div>

        {/* Live ID Card Preview (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CreditCard size={14} className="text-indigo-500" />
              Live Patron Badge Preview
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Interactive
            </span>
          </div>

          {/* Institutional RFID Card Render */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 dark:border-white/10 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 aspect-[1.586/1] flex flex-col justify-between">
            {/* Holographic Watermark Circle */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-violet-500/20 blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-base">
                  📚
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wider uppercase text-white/90">LibraryOS Patron</h4>
                  <p className="text-[9px] text-white/60 tracking-widest font-mono">DIGITAL ACCESS CREDENTIAL</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-white/10 text-indigo-300 border border-white/15">
                {formData.memberType}
              </span>
            </div>

            {/* Card Middle: Avatar + Name */}
            <div className="flex items-center gap-4 relative z-10 my-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xl font-black text-white shadow-lg border-2 border-white/20">
                {initials}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-base font-black truncate text-white">
                  {formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}`.trim() : 'Jane Doe'}
                </h3>
                <p className="text-xs text-white/70 truncate font-mono">
                  {formData.email || 'jane.doe@library.edu'}
                </p>
                <p className="text-[10px] text-indigo-300 font-mono mt-0.5">
                  ID: LIB-{Math.floor(100000 + Math.random() * 900000)}
                </p>
              </div>
            </div>

            {/* Card Footer: Barcode + Expiry */}
            <div className="pt-2 border-t border-white/10 flex items-end justify-between relative z-10">
              <div>
                <div className="font-mono text-[9px] tracking-widest text-white/50 mb-0.5">MEMBER PERK TIER</div>
                <div className="text-xs font-bold text-white/90">
                  {selectedPlan ? selectedPlan.name : 'Standard Access'}
                </div>
              </div>

              {/* Simulated barcode */}
              <div className="flex flex-col items-end">
                <div className="flex gap-0.5 h-6 items-end">
                  {[4, 2, 5, 1, 3, 6, 2, 4, 3, 5, 2, 6, 4, 2, 5].map((height, i) => (
                    <div
                      key={i}
                      className="bg-white/70"
                      style={{ width: `${(i % 2 === 0 ? 2 : 1.5)}px`, height: `${height * 3.5}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[8px] text-white/60 tracking-wider">RFID COMPLIANT</span>
              </div>
            </div>
          </div>

          {/* Quick Perks Overview Card */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-500" />
              Automated Member Verification
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Instant QR code generation upon registration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>SMS and Email welcome notification with login link</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Zero configuration circulation desk compatibility</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CreateMember;
