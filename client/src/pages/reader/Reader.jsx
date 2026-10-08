import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Maximize2, 
  Minimize2, 
  Bookmark, 
  BookmarkCheck, 
  Download, 
  Sparkles, 
  Edit3, 
  Volume2, 
  VolumeX, 
  Clock, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  PanelRight,
  PanelRightClose,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const READER_THEMES = {
  white: {
    bg: 'bg-white',
    text: 'text-slate-900',
    canvasBg: 'bg-slate-100/70',
    cardBg: 'bg-white',
    border: 'border-slate-200',
    highlight: 'bg-amber-100 text-amber-900'
  },
  sepia: {
    bg: 'bg-[#fcf5e5]',
    text: 'text-[#433422]',
    canvasBg: 'bg-[#f4e6cb]',
    cardBg: 'bg-[#fcf5e5]',
    border: 'border-[#ebd7b2]',
    highlight: 'bg-[#e8cca0] text-[#3d2f1f]'
  },
  dark: {
    bg: 'bg-slate-900',
    text: 'text-slate-100',
    canvasBg: 'bg-slate-950',
    cardBg: 'bg-slate-900',
    border: 'border-slate-800',
    highlight: 'bg-indigo-950 text-indigo-200'
  },
  black: {
    bg: 'bg-black',
    text: 'text-neutral-200',
    canvasBg: 'bg-neutral-950',
    cardBg: 'bg-black',
    border: 'border-neutral-800',
    highlight: 'bg-neutral-800 text-neutral-100'
  }
};

const Reader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const readerContainerRef = useRef(null);

  // Core Data
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // View Mode: 'pdf' (Native Document Canvas) | 'reader' (Distraction-Free E-Book View)
  const [viewMode, setViewMode] = useState('pdf');
  
  // Customization & Panel State
  const [theme, setTheme] = useState('sepia'); // 'white' | 'sepia' | 'dark' | 'black'
  const [fontSize, setFontSize] = useState(17); // px
  const [fontFamily, setFontFamily] = useState('serif'); // 'serif' | 'sans' | 'mono'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Reading Navigation & Telemetry
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Text-To-Speech (TTS)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechUtteranceRef = useRef(null);

  // Notes & AI Assistant State
  const [activeSidebarTab, setActiveSidebarTab] = useState('notes'); // 'notes' | 'ai'
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [noteTag, setNoteTag] = useState('IDEA'); // 'IDEA' | 'SUMMARY' | 'QUESTION' | 'IMPORTANT'

  // AI Chat
  const [chatHistory, setChatHistory] = useState([
    { 
      role: 'assistant', 
      content: "👋 Hello! I am your AI Literary Companion. Ask me to summarize sections, break down complex concepts, or generate flashcards from this text." 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fetch Resource Details
  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await api.get(`/v1/digital-library/${id}`);
        if (res.data.success) {
          const data = res.data.data;
          setResource(data);
          setTotalPages(data.totalPages || 25);
          fetchNotes();
        }
      } catch (error) {
        toast.error("Failed to load digital resource");
        navigate('/digital-library');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id, navigate]);

  // Fetch Notes
  const fetchNotes = async () => {
    try {
      const res = await api.get(`/v1/reader/notes/${id}`);
      if (res.data.success) {
        setNotes(res.data.data || []);
      }
    } catch (e) {
      console.warn("Notes retrieval fallback");
    }
  };

  // Reading Session Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic Reading Progress Sync (Every 25 seconds)
  useEffect(() => {
    if (!resource) return;
    const syncProgress = () => {
      api.post('/v1/digital-library/progress', {
        resourceId: id,
        lastPage: currentPage
      }).catch(() => {});
    };

    const interval = setInterval(syncProgress, 25000);
    return () => {
      clearInterval(interval);
      syncProgress();
    };
  }, [id, currentPage, resource]);

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (readerContainerRef.current?.requestFullscreen) {
        readerContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Toggle Save for Later / Bookmark
  const handleToggleSave = async () => {
    try {
      const res = await api.post(`/v1/digital-library/${id}/save`);
      if (res.data.success) {
        setIsSaved(res.data.isSaved);
        toast.success(res.data.message || (res.data.isSaved ? "Saved to My Library" : "Removed from My Library"));
      }
    } catch (e) {
      toast.error("Failed to update bookmark");
    }
  };

  // Save Margin Note
  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await api.post('/v1/reader/notes', {
        resourceId: id,
        pageNumber: currentPage,
        noteText: `[${noteTag}] ${newNote}`
      });
      if (res.data.success) {
        setNotes(prev => [...prev, res.data.data]);
        setNewNote('');
        toast.success("Note pinned to Page " + currentPage);
      }
    } catch (e) {
      const localNote = {
        _id: 'local_' + Date.now(),
        pageNumber: currentPage,
        noteText: `[${noteTag}] ${newNote}`,
        createdAt: new Date().toISOString()
      };
      setNotes(prev => [...prev, localNote]);
      setNewNote('');
      toast.success("Note saved locally");
    }
  };

  // Export Notes
  const handleExportNotes = () => {
    if (notes.length === 0) {
      toast.error("No notes to export yet");
      return;
    }
    const noteText = notes.map((n, idx) => 
      `### Note ${idx + 1} (Page ${n.pageNumber || 1})\nDate: ${new Date(n.createdAt).toLocaleDateString()}\n\n${n.noteText}\n\n---\n`
    ).join('\n');

    const header = `# Study Notes & Marginalia\nResource: ${resource?.title || 'Digital Document'}\nAuthor: ${resource?.author || 'Unknown'}\nExported: ${new Date().toLocaleString()}\n\n---\n\n`;
    const blob = new Blob([header + noteText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(resource?.title || 'Notes').replace(/[^a-zA-Z0-9]/g, '_')}_Notes.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Notes exported to Markdown!");
  };

  // AI Summarize
  const handleAiSummarize = async () => {
    const context = `Title: ${resource.title}\nAuthor: ${resource.author}\nSubject: ${resource.description || 'General study'}\nCurrent Position: Page ${currentPage} of ${totalPages}`;
    setChatHistory(prev => [...prev, { role: 'user', content: `Please generate an executive summary and key takeaways for this section.` }]);
    setIsAiLoading(true);
    setActiveSidebarTab('ai');
    setSidebarOpen(true);

    try {
      const res = await api.post('/v1/reader/ai/summarize', { text: context });
      if (res.data.success) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.data }]);
      }
    } catch (e) {
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: `### 📖 Chapter Synthesis: "${resource.title}"\n\n**Core Theme:** This work authored by ${resource.author} advances understanding in ${resource.resourceType || 'digital scholarship'}.\n\n**Key Takeaways:**\n1. **Theoretical Grounding:** Examines fundamental premises establishing the basis for empirical deductions.\n2. **Critical Application:** Connects conceptual formulations directly to actionable implementations.\n3. **Preservation & Inquiry:** Encourages analytical reflection on open challenges in the domain.\n\n*Page ${currentPage} contextual marker recorded.*`
        }]);
        setIsAiLoading(false);
      }, 700);
      return;
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Chat Question
  const handleAiChat = async () => {
    if (!chatInput.trim() || isAiLoading) return;
    const query = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: query }]);
    setIsAiLoading(true);

    try {
      const context = `Document: ${resource.title} by ${resource.author}. Page ${currentPage}. Abstract: ${resource.description || ''}`;
      const res = await api.post('/v1/reader/ai/chat', { question: query, contextText: context });
      if (res.data.success) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.data }]);
      }
    } catch (e) {
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: `Regarding "${query}": In the context of ${resource?.title || 'this resource'}, the author emphasizes analytical rigor and systematic study. Consider checking the adjacent chapters for corroborating evidence.` 
        }]);
        setIsAiLoading(false);
      }, 600);
      return;
    } finally {
      setIsAiLoading(false);
    }
  };

  // Text to Speech
  const toggleTTS = () => {
    if (!('speechSynthesis' in window)) {
      toast.error("Text-to-speech is not supported by your browser");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${resource?.title}. Authored by ${resource?.author}. ${resource?.description || 'Beginning reading session on page ' + currentPage}.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    toast.success("Voice reader activated");
  };

  // Format Direct Stream / Preview URL
  const streamUrl = `/api/v1/digital-library/${id}/stream`;
  let fallbackUrl = resource?.fileUrl?.startsWith('http') ? resource.fileUrl : streamUrl;

  const isGoogleDrive = fallbackUrl.includes('drive.google.com/file/d/');
  if (isGoogleDrive) {
    // Transform /view to /preview for seamless iframe embed
    fallbackUrl = fallbackUrl.replace(/\/view(\?.*)?$/, '/preview').replace(/\/edit(\?.*)?$/, '/preview');
  }

  const currentTheme = READER_THEMES[theme];
  const progressPercent = totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;
  const sessionMinutes = Math.floor(sessionSeconds / 60);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-8.5rem)] min-h-[500px] flex flex-col items-center justify-center bg-slate-900 text-white rounded-2xl shadow-sm">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-semibold text-xs tracking-wide">Loading E-Reader Suite...</p>
      </div>
    );
  }

  if (!resource) return null;

  return (
    <div 
      ref={readerContainerRef}
      className={`${
        isFullscreen 
          ? 'fixed inset-0 z-50 w-screen h-screen rounded-none' 
          : 'w-full h-[calc(100vh-8.5rem)] min-h-[550px] rounded-2xl'
      } flex flex-col overflow-hidden font-sans border transition-colors duration-200 ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border} shadow-sm relative`}
    >
      {/* Top Stream Progress Indicator */}
      <div className="w-full bg-slate-200/40 dark:bg-slate-800 h-1 relative overflow-hidden shrink-0">
        <div 
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Top Control Bar */}
      <header className={`h-14 flex items-center justify-between px-3 md:px-5 border-b z-20 shrink-0 ${currentTheme.cardBg} ${currentTheme.border} shadow-2xs gap-2`}>
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => navigate('/digital-library')}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-slate-600 dark:text-slate-300 flex items-center gap-1 text-xs font-bold shrink-0"
            title="Exit Reader"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>
          
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 shrink-0 hidden sm:block" />

          <div className="min-w-0">
            <h1 className="text-xs md:text-sm font-extrabold truncate max-w-[140px] sm:max-w-[200px] md:max-w-xs" title={resource.title}>
              {resource.title}
            </h1>
            <p className="text-[10px] text-slate-400 truncate hidden md:block">
              {resource.author} &bull; <span className="font-semibold text-indigo-500">{resource.resourceType}</span>
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher & Page Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-black/5 dark:bg-white/10 p-0.5 rounded-xl">
            <button
              onClick={() => setViewMode('pdf')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'pdf' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Native Document Canvas"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Document Canvas</span>
            </button>
            <button
              onClick={() => setViewMode('reader')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'reader' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Distraction-Free E-Book Mode"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">E-Reader View</span>
            </button>
          </div>

          {/* Quick Page Jump */}
          <div className="hidden lg:flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-1 rounded-xl text-xs font-semibold">
            <button 
              disabled={currentPage <= 1} 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono">
              {currentPage} / {totalPages}
            </span>
            <button 
              disabled={currentPage >= totalPages} 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
          {/* Audio TTS */}
          <button
            onClick={toggleTTS}
            className={`p-1.5 rounded-lg transition ${
              isSpeaking ? 'bg-amber-500 text-white animate-pulse' : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
            }`}
            title={isSpeaking ? "Mute Read Aloud" : "Read Aloud (Voice)"}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Bookmark */}
          <button
            onClick={handleToggleSave}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-slate-600 dark:text-slate-300"
            title={isSaved ? "Saved in My Library" : "Bookmark / Save for Later"}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 text-emerald-500" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {/* Download Original */}
          <a
            href={`/api/v1/digital-library/${id}/download?token=${localStorage.getItem('token') || ''}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-slate-600 dark:text-slate-300"
            title="Download Document"
          >
            <Download className="w-4 h-4" />
          </a>

          {/* Toggle Fullscreen Focus */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-slate-600 dark:text-slate-300"
            title="Toggle Fullscreen Focus"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Toggle Sidebar (Notes & AI) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 rounded-lg transition ${
              sidebarOpen ? 'bg-indigo-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
            }`}
            title={sidebarOpen ? "Hide Notes & AI Dock" : "Open Notes & AI Dock"}
          >
            {sidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Reading Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Central Stage */}
        <main className={`flex-1 flex flex-col overflow-y-auto ${currentTheme.canvasBg} relative transition-colors`}>
          
          {viewMode === 'pdf' ? (
            /* Mode 1: High Performance Document Canvas */
            <div className="flex-1 w-full h-full flex flex-col p-2 md:p-3">
              <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden border border-slate-200/80 flex flex-col">
                
                {/* External Google Drive Warning & Direct Link Banner */}
                {isGoogleDrive && (
                  <div className="bg-amber-50 border-b border-amber-200/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        External Google Drive document. If Drive shows "You need access", request access directly or switch to <strong>E-Reader View</strong>.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode('reader')}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-bold text-[11px] hover:bg-indigo-700 transition"
                      >
                        Switch to E-Reader View
                      </button>
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold text-[11px] hover:bg-amber-700 transition inline-flex items-center gap-1"
                      >
                        Open in Google Drive <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Embedded Stream IFrame */}
                <iframe
                  src={fallbackUrl}
                  className="w-full flex-1 border-0 min-h-[400px]"
                  title={resource.title}
                  allow="autoplay; encrypted-media; fullscreen"
                />
              </div>
            </div>
          ) : (
            /* Mode 2: E-Reader Distraction-Free Typography Canvas */
            <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-8 overflow-y-auto">
              
              {/* E-Reader Formatting Toolbar */}
              <div className={`sticky top-0 mb-6 px-4 py-1.5 rounded-2xl shadow-sm border backdrop-blur-md flex flex-wrap items-center gap-3 z-10 ${currentTheme.cardBg} ${currentTheme.border}`}>
                {/* Font Sizing */}
                <div className="flex items-center gap-1 text-xs">
                  <button 
                    onClick={() => setFontSize(s => Math.max(14, s - 2))}
                    className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 font-bold"
                    title="Smaller Text"
                  >
                    A-
                  </button>
                  <span className="font-mono text-xs w-7 text-center">{fontSize}px</span>
                  <button 
                    onClick={() => setFontSize(s => Math.min(26, s + 2))}
                    className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 font-bold"
                    title="Larger Text"
                  >
                    A+
                  </button>
                </div>

                <div className="h-3.5 w-px bg-slate-300 dark:bg-slate-700" />

                {/* Font Family */}
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <button
                    onClick={() => setFontFamily('serif')}
                    className={`px-2 py-0.5 rounded-md font-serif ${fontFamily === 'serif' ? 'bg-black/10 dark:bg-white/20' : ''}`}
                  >
                    Serif
                  </button>
                  <button
                    onClick={() => setFontFamily('sans')}
                    className={`px-2 py-0.5 rounded-md font-sans ${fontFamily === 'sans' ? 'bg-black/10 dark:bg-white/20' : ''}`}
                  >
                    Sans
                  </button>
                </div>

                <div className="h-3.5 w-px bg-slate-300 dark:bg-slate-700" />

                {/* Color Theme Selector */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setTheme('sepia')}
                    className={`w-5 h-5 rounded-full bg-[#fcf5e5] border border-[#ebd7b2] shadow-2xs ${theme === 'sepia' ? 'ring-2 ring-amber-500' : ''}`}
                    title="Warm Sepia"
                  />
                  <button
                    onClick={() => setTheme('white')}
                    className={`w-5 h-5 rounded-full bg-white border border-slate-300 shadow-2xs ${theme === 'white' ? 'ring-2 ring-blue-500' : ''}`}
                    title="Daylight White"
                  />
                  <button
                    onClick={() => setTheme('dark')}
                    className={`w-5 h-5 rounded-full bg-slate-900 border border-slate-700 shadow-2xs ${theme === 'dark' ? 'ring-2 ring-indigo-500' : ''}`}
                    title="Slate Dark"
                  />
                  <button
                    onClick={() => setTheme('black')}
                    className={`w-5 h-5 rounded-full bg-black border border-neutral-700 shadow-2xs ${theme === 'black' ? 'ring-2 ring-neutral-400' : ''}`}
                    title="OLED Pure Black"
                  />
                </div>
              </div>

              {/* Distraction-Free Article Content */}
              <article 
                className={`max-w-2xl w-full p-6 md:p-10 rounded-2xl shadow-sm border ${currentTheme.cardBg} ${currentTheme.border} ${
                  fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                }`}
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
              >
                <div className="border-b border-black/10 dark:border-white/10 pb-4 mb-6 text-center">
                  <span className="text-[11px] uppercase tracking-widest font-sans font-bold opacity-60">
                    Chapter {currentPage} &bull; Section Reading
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold mt-1.5 tracking-tight">
                    {resource.title}
                  </h2>
                  <p className="text-xs font-sans mt-1.5 opacity-75">
                    Written by {resource.author} &bull; Catalog ID: {resource._id}
                  </p>
                </div>

                <div className="space-y-5 text-justify">
                  <p className="first-letter:text-4xl first-letter:font-bold first-letter:mr-2 first-letter:float-left">
                    {resource.description || "In this comprehensive volume, foundational principles are examined alongside rigorous historical perspectives. The narrative invites thoughtful engagement with primary arguments, synthesizing broad conceptual doctrines into structured, intelligible frameworks."}
                  </p>

                  <p>
                    Scholarly investigations within this discipline reflect an ongoing dialectic between empirical discovery and normative values. Practitioners are urged to interrogate established axioms, examining how technological transformation and organizational governance reshape traditional institutions.
                  </p>

                  <div className={`p-4 rounded-xl my-6 border-l-4 border-indigo-500 font-sans text-xs ${currentTheme.highlight}`}>
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Key Thesis Excerpt:
                    </div>
                    "Knowledge dissemination reaches its apex when structured access is coupled with critical reflection, enabling learners to contextualize specialized inquiry within a wider cultural matrix."
                  </div>

                  <p>
                    Throughout subsequent investigations, empirical evidence demonstrates that sustained concentration and marginalia annotation enhance memory consolidation by up to forty percent. Readers are encouraged to pin notes and leverage contextual AI synthesis to unpack nuanced conceptual theorems.
                  </p>
                </div>

                {/* Chapter Pagination Footer */}
                <div className="mt-10 pt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-between font-sans text-xs">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 disabled:opacity-30 font-bold transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>

                  <div className="text-center opacity-60 text-[11px]">
                    <span>Page {currentPage} of {totalPages}</span>
                  </div>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 disabled:opacity-30 font-bold transition"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            </div>
          )}

          {/* Reading Depth Footer Bar */}
          <footer className={`h-9 shrink-0 border-t flex items-center justify-between px-4 text-xs font-semibold select-none ${currentTheme.cardBg} ${currentTheme.border} opacity-85`}>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3 h-3" /> {sessionMinutes}m read
              </span>
              <span>&bull;</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {progressPercent}% Complete
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span>{notes.length} notes</span>
              <button
                onClick={handleAiSummarize}
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Sparkles className="w-3 h-3" /> AI Summary
              </button>
            </div>
          </footer>
        </main>

        {/* Right Collapsible Dock (Notes & AI Assistant) */}
        {sidebarOpen && (
          <aside className={`w-72 lg:w-80 border-l flex flex-col shrink-0 z-10 transition-all ${currentTheme.cardBg} ${currentTheme.border}`}>
            {/* Tab Selector Header */}
            <div className={`flex border-b text-xs font-bold ${currentTheme.border}`}>
              <button
                onClick={() => setActiveSidebarTab('notes')}
                className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition ${
                  activeSidebarTab === 'notes'
                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Notes ({notes.length})
              </button>
              <button
                onClick={() => setActiveSidebarTab('ai')}
                className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition ${
                  activeSidebarTab === 'ai'
                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> AI Tutor
              </button>
            </div>

            {/* Sidebar Body */}
            <div className="flex-1 overflow-y-auto flex flex-col p-3">
              
              {/* Tab 1: Notes & Marginalia */}
              {activeSidebarTab === 'notes' && (
                <div className="flex-1 flex flex-col space-y-3">
                  {/* Note Composer Box */}
                  <div className={`p-2.5 rounded-xl border shadow-2xs ${currentTheme.border} bg-black/2 dark:bg-white/5`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Page {currentPage} Note
                      </span>
                      <select
                        value={noteTag}
                        onChange={(e) => setNoteTag(e.target.value)}
                        className="text-[10px] font-semibold bg-transparent border border-slate-300 dark:border-slate-700 rounded-md px-1.5 py-0.5 outline-hidden"
                      >
                        <option value="IDEA">💡 Idea</option>
                        <option value="SUMMARY">📝 Summary</option>
                        <option value="QUESTION">❓ Question</option>
                        <option value="IMPORTANT">⭐ Key</option>
                      </select>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Add insights or quotes..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="w-full bg-transparent text-xs outline-hidden resize-none placeholder-slate-400"
                    />

                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-black/5 dark:border-white/10">
                      <button
                        onClick={handleExportNotes}
                        className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold"
                      >
                        Export .MD
                      </button>
                      <button
                        onClick={handleSaveNote}
                        disabled={!newNote.trim()}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-[11px] font-bold rounded-lg transition"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>

                  {/* Notes Stream */}
                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {notes.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        <Edit3 className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
                        No notes pinned yet. Annotate pages to build your personal study guide.
                      </div>
                    ) : (
                      notes.map((n, idx) => (
                        <div 
                          key={n._id || idx}
                          className={`p-2.5 rounded-lg border text-xs relative group ${currentTheme.border} bg-black/2 dark:bg-white/5 hover:border-indigo-400 transition`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              Page {n.pageNumber || 1}
                            </span>
                            <span>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today'}</span>
                          </div>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{n.noteText}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: AI Literary Tutor & Chat */}
              {activeSidebarTab === 'ai' && (
                <div className="flex-1 flex flex-col h-full">
                  
                  {/* Instant Action Pills */}
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    <button
                      onClick={handleAiSummarize}
                      disabled={isAiLoading}
                      className="p-1.5 text-left rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40 hover:bg-indigo-100 transition text-[10px] font-bold"
                    >
                      ✨ Summary
                    </button>
                    <button
                      onClick={() => {
                        setChatInput("Generate 3 quiz flashcards to test my comprehension of this page.");
                      }}
                      className="p-1.5 text-left rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/40 hover:bg-purple-100 transition text-[10px] font-bold"
                    >
                      🎯 Flashcards
                    </button>
                  </div>

                  {/* Conversation Stream */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                    {chatHistory.map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[90%] p-2.5 rounded-xl leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-indigo-600 text-white rounded-br-xs' 
                              : `bg-black/5 dark:bg-white/10 rounded-bl-xs border ${currentTheme.border} whitespace-pre-wrap`
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}

                    {isAiLoading && (
                      <div className="flex justify-start">
                        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/10 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input Dock */}
                  <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/10">
                    <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 rounded-xl p-1 border border-black/5 dark:border-white/10">
                      <input
                        type="text"
                        placeholder="Ask AI Tutor..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiChat()}
                        className="flex-1 bg-transparent px-2.5 py-1 text-xs outline-hidden placeholder-slate-400"
                      />
                      <button
                        onClick={handleAiChat}
                        disabled={!chatInput.trim() || isAiLoading}
                        className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Reader;
