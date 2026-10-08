import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  BookOpen, Sparkles, ArrowRight, ShieldCheck, Zap, 
  CheckCircle2, Laptop, Users, Building2, Barcode, 
  CreditCard, Compass, ChevronDown, ChevronUp, Star, 
  Sun, Moon, ExternalLink, Activity, HardDrive, 
  Layers, Lock, Play, Flame, Search
} from 'lucide-react';
import { APP_VERSION, APP_RELEASE_NAME } from '../../constants/version';

const LandingPage = () => {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [activeTab, setActiveTab] = useState('circulation');
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();
  const token = useSelector(state => state.auth?.token);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Check initial theme
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const FAQS = [
    {
      q: "How does data migration work from Koha or Excel spreadsheets?",
      a: "LibraryOS includes a built-in Data Migration Hub. You can upload standard .CSV or .XLSX spreadsheets with automatic schema reconciliation. Existing barcodes, member codes, and book taxonomies are preserved flawlessly."
    },
    {
      q: "Can we use our existing USB or Bluetooth barcode scanners?",
      a: "Yes! LibraryOS supports standard HID barcode scanners out-of-the-box. Our Circulation Desk and Optical Camera Scanner capture standard ISBN-10, ISBN-13, and Code-128 barcodes instantly without extra drivers."
    },
    {
      q: "Does LibraryOS support multi-branch universities and consortiums?",
      a: "Absolutely. You can manage central campuses, distributed branch libraries, department collections, and inter-branch book transfers with unified reporting and role-based permissions."
    },
    {
      q: "How does the Digital E-Reader and AI Study Copilot work?",
      a: "Members can stream digital PDFs and EPUBs online. The AI Study Copilot assists patrons by summarizing complex chapters, generating study flashcards, and explaining terminology in real-time."
    },
    {
      q: "Can we issue physical and printable digital Member ID cards?",
      a: "Yes. LibraryOS generates high-resolution printable PVC ID cards with embedded dynamic QR codes for physical turnstiles, attendance verification, and self-checkout stations."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090b11] text-slate-900 dark:text-slate-100 transition-colors selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* 1. Global Navigation Bar */}
      <nav className="glass-nav sticky top-0 z-50 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Library<span className="text-blue-600 dark:text-blue-400">OS</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                  v{APP_VERSION}
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Features</a>
              <Link to="/portal" className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1">
                <span>Public Catalog</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <a href="#architecture" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Architecture</a>
              <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Pricing</a>
              <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition">FAQ</a>
            </div>

            {/* Right CTAs */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all shadow-sm"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {token ? (
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
                >
                  <span>Open Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    to="/login" 
                    className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-all transform active:scale-95"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-24 pb-20 px-4 text-center overflow-hidden">
        {/* Ambient Gradient Blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 blur-[130px] rounded-full pointer-events-none mix-blend-screen opacity-70"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200/80 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 font-semibold text-xs tracking-wide shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>Announcing LibraryOS 2.0 {APP_RELEASE_NAME}</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-[11px] underline">Explore What's New →</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            The Operating System for <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
              Modern Libraries & Campuses
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed font-normal">
            Supercharge physical book circulation, digital e-reading, turnstile telemetry, patron PVC badges, and fine automation with unified high-density precision.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link 
              to="/portal" 
              className="w-full sm:w-auto px-7 py-3.5 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <Compass className="w-4 h-4 text-blue-500" />
              <span>Explore Public Catalog</span>
            </Link>
          </div>

          {/* Trust Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-6 border-t border-slate-200/80 dark:border-white/10 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">99.98%</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Uptime SLA</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">0.04s</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Search Latency</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">100k+</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Books Managed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">SOC-2</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">FERPA Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Product Demo Showcase */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl overflow-hidden p-2 sm:p-4">
          
          {/* Mock Window Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="text-[11px] text-slate-400 font-mono ml-2 hidden sm:inline">
                https://console.libraryos.internal/v2/telemetry
              </span>
            </div>

            {/* Feature Tabs */}
            <div className="flex items-center gap-1">
              {[
                { id: 'circulation', label: 'Circulation Telemetry' },
                { id: 'ai', label: 'AI Study Assistant' },
                { id: 'cards', label: 'Smart PVC Badges' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Screen Preview */}
          <div className="p-6 sm:p-8 bg-slate-50/30 dark:bg-slate-950/40 rounded-b-2xl">
            {activeTab === 'circulation' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-card p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80">
                    <span className="text-xs text-slate-400 block mb-1">Circulation Health Score</span>
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">99.4%</span>
                    <span className="text-[11px] text-slate-500 block mt-1">+2.4% over last month</span>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80">
                    <span className="text-xs text-slate-400 block mb-1">Active Loans Today</span>
                    <span className="text-3xl font-black text-blue-600 dark:text-blue-400">342 Books</span>
                    <span className="text-[11px] text-slate-500 block mt-1">Zero overdue penalties</span>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80">
                    <span className="text-xs text-slate-400 block mb-1">Turnstile Campus Occupancy</span>
                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">128 Inside</span>
                    <span className="text-[11px] text-emerald-500 flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Real-time gatekeeper
                    </span>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Barcode className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Rapid 2-Step Issue Desk</h4>
                      <p className="text-xs text-slate-400">Scan student card barcode + scan book copy barcode = instant checkout under 1.2s</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">
                    Active
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="glass-card p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-4 h-4" />
                    <span>LibraryOS Copilot Neural Engine</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    "I analyzed your inventory. You have 14 copies of 'Clean Architecture' checked out, and 3 reserved. Would you like me to notify waitlisted members as soon as a copy is returned?"
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[11px] px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60">
                    ✓ Full-text Semantic Search
                  </span>
                  <span className="text-[11px] px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60">
                    ✓ E-Book Chapter Summaries
                  </span>
                  <span className="text-[11px] px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                    ✓ Quiz & Flashcard Generation
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'cards' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Custom PVC Patron Badges</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                    Generate printable standard CR80 credit-card sized badges with encrypted QR codes, member photos, and validity periods.
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>One-click PDF Export for Thermal Card Printers</span>
                  </div>
                </div>

                {/* Mini Card Mockup */}
                <div className="w-64 h-36 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-800 text-white p-4 shadow-xl flex flex-col justify-between border border-white/20">
                  <div className="flex justify-between items-center text-[10px] font-bold tracking-wider opacity-80">
                    <span>LibraryOS PATRON</span>
                    <span>STUDENT</span>
                  </div>
                  <div>
                    <div className="text-xs font-extrabold">AARAV SHARMA</div>
                    <div className="text-[9px] font-mono opacity-80">ID: LIB-2026-9041</div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-[8px] opacity-70">EXP: 10/2028</div>
                    <div className="w-8 h-8 bg-white p-0.5 rounded text-[8px] text-black font-mono flex items-center justify-center font-bold">
                      QR
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Core Features Grid */}
      <section id="features" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2">
            Engineered For Higher Education & Modern Libraries
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Everything your library needs to run like modern software
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              High-Speed Circulation Desk
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Issue and return books in seconds with keyboard shortcuts, barcode scanners, patron photo validation, and automatic due date calculation.
            </p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Cloud E-Reader & Streamer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Read digital research papers, thesis documents, and textbooks in your browser with interactive notes, page bookmarks, and AI summaries.
            </p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Barcode className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              AI Smart Barcode Scanner
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Point your camera at any book ISBN barcode. LibraryOS automatically fetches title, author, cover art, and descriptions from Google Books.
            </p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Turnstile & Gate Telemetry
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Monitor live room occupancy, daily check-in volume, visitor logs, and turnstile hardware status with 8-second real-time polling.
            </p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Fines, Billing & Razorpay
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Automate overdue fines, collect patron dues, issue instant digital receipts, and charge online via integrated Razorpay payment gateway.
            </p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Hardened Multi-Tenancy
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Role-based granular access control for Super Admins, Librarians, and Students with tenant encryption isolation and complete audit logs.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Architecture Highlights */}
      <section id="architecture" className="py-20 px-4 border-y border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-slate-950/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2">
                Enterprise Infrastructure
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                Built for zero downtime and massive concurrent circulation
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Unlike legacy desktop software from the 2000s, LibraryOS runs as a modern cloud-native system with reactive microservices, instant Vite HMR interfaces, and high-throughput MongoDB indexes.
              </p>

              <div className="space-y-3">
                {[
                  "Multi-tenant database isolation prevents cross-tenant data leaks",
                  "Automated nightly CRON jobs calculate fines & dispatch email notifications",
                  "Webcam and barcode scanner integration without native software plugins",
                  "RESTful API endpoints with JWT authentication and audit trails"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">System Telemetry Benchmarks</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                  Live
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span>Catalog Fuzzy Search Index</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">38ms</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-full w-[94%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span>Barcode Optical Scan Processing</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">120ms</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[88%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span>Concurrent Patron Throughput</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">10,000 req/sec</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-purple-600 h-full w-[98%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Section */}
      <section id="pricing" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2">
            Predictable Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Pick the right tier for your institution
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            All plans include a 14-day free trial. No credit card required to start.
          </p>

          {/* Monthly / Annual Switcher */}
          <div className="inline-flex items-center gap-2 p-1 mt-6 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Starter Tier */}
          <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Community Starter</h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">Ideal for community libraries, reading rooms & small schools</p>
              
              <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-black text-slate-900 dark:text-white">₹{billingCycle === 'annual' ? '799' : '999'}</span>
                <span className="text-xs text-slate-400 ml-1">/month</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Up to 2,000 Catalogued Books</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Up to 500 Active Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Single Branch Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Optical Barcode Scanner</span>
                </div>
              </div>
            </div>

            <Link 
              to="/register" 
              className="mt-8 w-full py-3 text-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-900 dark:text-white transition"
            >
              Get Started Free
            </Link>
          </div>

          {/* Professional Plan (Featured) */}
          <div className="glass-card rounded-3xl border-2 border-blue-500 bg-white dark:bg-slate-900 backdrop-blur-xl p-8 flex flex-col justify-between shadow-xl relative scale-105 z-10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-md">
              Most Popular
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Professional Campus</h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">Designed for colleges, universities, and multi-branch libraries</p>
              
              <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-black text-slate-900 dark:text-white">₹{billingCycle === 'annual' ? '2,399' : '2,999'}</span>
                <span className="text-xs text-slate-400 ml-1">/month</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Unlimited Books & ISBN Registry</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Up to 5,000 Active Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Up to 5 Active Branches & Transfers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>AI Study Copilot & Cloud E-Reader</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Printable PVC Member ID Generator</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Turnstile Gate Telemetry & Kiosk Mode</span>
                </div>
              </div>
            </div>

            <Link 
              to="/register" 
              className="mt-8 w-full py-3.5 text-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-xs text-white shadow-md shadow-blue-500/25 transition active:scale-95"
            >
              Start 14-Day Pro Trial
            </Link>
          </div>

          {/* Enterprise Consortium Tier */}
          <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Titanium Enterprise</h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">For nationwide library chains, states & large university systems</p>
              
              <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-black text-slate-900 dark:text-white">Custom</span>
                <span className="text-xs text-slate-400 ml-1">/annual SLA</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Unlimited Branches & Consortia</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Dedicated Private Cloud or On-Premise</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>White-Label Branding & Custom Domain</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>99.98% High Availability Uptime SLA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>24/7 Dedicated Account Manager</span>
                </div>
              </div>
            </div>

            <a 
              href="mailto:support@libraryos.internal" 
              className="mt-8 w-full py-3 text-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold text-xs transition"
            >
              Contact Enterprise Sales
            </a>
          </div>

        </div>
      </section>

      {/* 7. FAQ Accordion */}
      <section id="faq" className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Have questions? We're here to help.
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Final CTA Banner */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="rounded-3xl p-10 sm:p-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white text-center shadow-2xl relative overflow-hidden border border-blue-400/30">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              Modernize your library operations in under 10 minutes
            </h2>
            <p className="text-sm sm:text-base text-blue-100 mb-8 leading-relaxed opacity-90">
              Join leading universities, colleges, and schools who transformed their circulation and digital catalog with LibraryOS v2.0 Titanium.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                to="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-blue-700 font-extrabold text-sm rounded-xl shadow-lg hover:bg-blue-50 transition active:scale-95"
              >
                Start Your Free Trial
              </Link>
              <Link 
                to="/portal" 
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 backdrop-blur-md transition"
              >
                Browse Public Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Modern Footer */}
      <footer className="border-t border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-950 py-12 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
              📚
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                LibraryOS <span className="text-xs text-blue-500 font-normal">v{APP_VERSION}</span>
              </p>
              <p className="text-xs text-slate-400">Enterprise Operating System for Modern Libraries</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Link to="/portal" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Public Catalog</Link>
            <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Staff Sign In</Link>
            <Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Create Account</Link>
            <Link to="/help" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Documentation</Link>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All Systems Operational • SOC-2 Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
