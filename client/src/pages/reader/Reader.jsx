import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Setup pdf.js worker - using unpkg for more reliable CDN delivery in Vite apps
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Reader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resource, setResource] = useState(null);
  const readerRef = React.useRef(null);
  
  // PDF State
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(parseInt(searchParams.get('page')) || 1);
  const [scale, setScale] = useState(1.0);
  
  // UI State
  const [activeTab, setActiveTab] = useState('notes'); // notes, ai
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Features State
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [chatHistory, setChatHistory] = useState([{ role: 'assistant', content: "Hi! I'm your AI Reading Assistant. I can summarize pages, explain concepts, or answer any questions about the current page." }]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [pageText, setPageText] = useState("");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await api.get(`/v1/digital-library/${id}`);
        if (res.data.success) {
          setResource(res.data.data);
          fetchNotes();
        }
      } catch (error) {
        toast.error("Failed to load resource");
        navigate('/digital-library');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id, navigate]);

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/v1/reader/notes/${id}`);
      if (res.data.success) {
        setNotes(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load notes");
    }
  };

  useEffect(() => {
    // Sync reading progress every 30 seconds
    const interval = setInterval(() => {
      if (resource) {
        api.post('/v1/digital-library/progress', {
          resourceId: id,
          lastPage: pageNumber
        }).catch(() => {});
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [pageNumber, resource, id]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = async (page) => {
    try {
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      setPageText(text);
    } catch (err) {
      console.error("Could not extract text", err);
    }
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      if (newPage < 1) return 1;
      if (newPage > numPages) return numPages;
      return newPage;
    });
  };

  const saveNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await api.post('/v1/reader/notes', {
        resourceId: id,
        pageNumber,
        noteText: newNote
      });
      if (res.data.success) {
        setNotes([...notes, res.data.data]);
        setNewNote("");
        toast.success("Note saved");
      }
    } catch (error) {
      toast.error("Failed to save note");
    }
  };

  const askAiSummarize = async () => {
    let context = pageText?.trim();
    if (!context) {
      if (resource?.description) {
        context = `Title: ${resource.title}\nDescription: ${resource.description}`;
      } else {
        toast.error("No readable text found on this page to summarize.");
        return;
      }
    }
    
    const userMsg = { role: 'user', content: 'Please summarize this page.' };
    setChatHistory(prev => [...prev, userMsg]);
    setIsAiLoading(true);
    
    try {
      const res = await api.post('/v1/reader/ai/summarize', { text: context });
      if (res.data.success) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.data }]);
      }
    } catch (error) {
      toast.error("AI request failed");
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Failed to generate summary." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const askAiChat = async () => {
    if (!chatInput.trim()) return;
    
    let context = pageText?.trim();
    if (!context) {
      if (resource?.description) {
        context = `Title: ${resource.title}\nDescription: ${resource.description}`;
      } else {
        toast.error("No readable text found on this page to use as context.");
        return;
      }
    }
    
    const userMsg = { role: 'user', content: chatInput };
    const question = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, userMsg]);
    setIsAiLoading(true);
    
    try {
      const res = await api.post('/v1/reader/ai/chat', { question, contextText: context });
      if (res.data.success) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.data }]);
      }
    } catch (error) {
      toast.error("AI request failed");
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Failed to get an answer." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // Construct absolute URL using api baseURL to prevent CORS/404 in production
    let base = api.defaults.baseURL || 'http://localhost:5000';
    if (base.endsWith('/api') || base.endsWith('/api/v1')) {
      base = base.replace(/\/api(\/v1)?$/, '');
    }
    if (base.endsWith('/') && url.startsWith('/')) {
      base = base.slice(0, -1);
    }
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Loading Reader Engine...</div>;
  if (!resource) return null;

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (readerRef.current?.requestFullscreen) {
        readerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const isExternalUrl = resource.fileUrl?.startsWith('http') && !resource.fileUrl.includes('cloudinary.com') && !resource.fileUrl.includes('localhost');

  return (
    <div ref={readerRef} className={`flex h-screen flex-col ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-900'} transition-colors`}>
      
      {/* Top Toolbar */}
      <div className={`h-16 flex items-center justify-between px-6 border-b ${isDarkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-300 bg-white shadow-sm'}`}>
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 hover:text-blue-500">
            &larr; Exit
          </button>
          <h1 className="font-bold truncate max-w-[200px]" title={resource.title}>{resource.title}</h1>
        </div>
        
        {/* Pagination Moved to Top Toolbar */}
        {!isExternalUrl && (
          <div className="flex items-center gap-2 font-medium">
            <button disabled={pageNumber <= 1} onClick={() => changePage(-1)} className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50 text-lg">&lt;</button>
            <span className="text-sm">Page {pageNumber} of {numPages || '--'}</span>
            <button disabled={pageNumber >= numPages} onClick={() => changePage(1)} className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50 text-lg">&gt;</button>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          {!isExternalUrl && (
            <div className="flex gap-2">
              <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="p-2 bg-gray-200 dark:bg-gray-800 rounded text-sm">Zoom Out</button>
              <span className="p-2 font-bold text-sm">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(s => Math.min(2.5, s + 0.25))} className="p-2 bg-gray-200 dark:bg-gray-800 rounded text-sm">Zoom In</button>
            </div>
          )}
          <button 
            onClick={toggleFullScreen}
            className="p-2 rounded bg-gray-200 dark:bg-gray-800 text-sm"
            title="Toggle Fullscreen"
          >
            ⛶ Fullscreen
          </button>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded bg-gray-200 dark:bg-gray-800 text-sm"
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* PDF Viewer Area */}
        <div className="flex-1 overflow-auto p-8 relative flex justify-center">
          <div className="shadow-2xl w-full max-w-5xl flex justify-center bg-white dark:bg-gray-800 rounded-xl overflow-hidden min-h-[800px]">
             {isExternalUrl ? (
               <div className="w-full h-full flex flex-col">
                 <div className="bg-blue-50 dark:bg-blue-900/30 p-3 text-sm text-blue-800 dark:text-blue-200 border-b border-blue-200 dark:border-blue-800 text-center flex justify-between items-center px-6">
                   <span>This is an externally hosted resource.</span>
                   <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="font-bold bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition">
                     Open in New Tab ↗
                   </a>
                 </div>
                 <iframe 
                   src={resource.fileUrl.includes('drive.google.com/file/d/') ? resource.fileUrl.replace(/\/view.*$/, '/preview') : resource.fileUrl} 
                   className="w-full h-full border-0 min-h-[800px]"
                   title={resource.title}
                   allow="autoplay; encrypted-media"
                 ></iframe>
               </div>
             ) : (
               <Document
                file={getFileUrl(resource.fileUrl)}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="p-10 flex flex-col items-center justify-center h-full"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div><p>Loading PDF Engine...</p></div>}
                error={<div className="p-10 text-red-500 font-bold flex flex-col items-center"><span className="text-4xl mb-4">⚠️</span> Error loading PDF. Ensure the URL is valid or CORS is enabled.</div>}
                className="flex justify-center"
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  renderTextLayer={false} 
                  renderAnnotationLayer={false}
                  onLoadSuccess={onPageLoadSuccess}
                  className={`${isDarkMode ? 'filter invert hue-rotate-180' : ''} shadow-lg`} 
                />
              </Document>
             )}
          </div>
        </div>

        {/* Right Sidebar (Notes & AI) */}
        <div className={`w-96 border-l flex flex-col ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-300 bg-white'}`}>
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button 
              className={`flex-1 p-4 font-bold ${activeTab === 'notes' ? 'text-blue-500 border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              Notes
            </button>
            {!isExternalUrl && (
              <button 
                className={`flex-1 p-4 font-bold flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'text-blue-500 border-b-2 border-blue-500' : ''}`}
                onClick={() => setActiveTab('ai')}
              >
                <span className="text-xl">🤖</span> AI Assistant
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-0 flex flex-col h-full">
            {activeTab === 'notes' && (
              <div className="space-y-6 p-4">
                <div>
                  <textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={`Add a note for Page ${pageNumber}...`}
                    className={`w-full p-3 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                    rows="3"
                  />
                  <button 
                    onClick={saveNote}
                    className="mt-2 w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                  >
                    Save Note
                  </button>
                </div>

                <div className="space-y-4">
                  {notes.filter(n => n.pageNumber === pageNumber).length > 0 && <h3 className="font-bold text-sm text-gray-500 uppercase">Notes on this page</h3>}
                  {notes.filter(n => n.pageNumber === pageNumber).map(note => (
                    <div key={note._id} className={`p-4 rounded-lg border-l-4 border-yellow-400 ${isDarkMode ? 'bg-gray-800' : 'bg-yellow-50'}`}>
                      <p className="text-sm">{note.noteText}</p>
                    </div>
                  ))}
                  
                  {notes.filter(n => n.pageNumber !== pageNumber).length > 0 && <h3 className="font-bold text-sm text-gray-500 uppercase mt-6">Other Notes</h3>}
                  {notes.filter(n => n.pageNumber !== pageNumber).map(note => (
                    <div key={note._id} className={`p-4 rounded-lg cursor-pointer ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} onClick={() => setPageNumber(note.pageNumber)}>
                      <span className="text-xs font-bold text-gray-500">Page {note.pageNumber}</span>
                      <p className="text-sm mt-1 truncate">{note.noteText}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="flex flex-col h-full bg-white/50 dark:bg-gray-900/50">
                <div className="flex gap-2 p-3 border-b dark:border-gray-800">
                  <button onClick={askAiSummarize} disabled={isAiLoading} className="flex-1 py-1.5 px-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50">
                    Summarize Page
                  </button>
                  <button onClick={() => setChatInput("Explain the main concept of this page.")} className="flex-1 py-1.5 px-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold rounded-lg hover:shadow-lg transition">
                    Explain Concept
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : (isDarkMode ? 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200 shadow-sm')} whitespace-pre-wrap`}>
                        {msg.role === 'assistant' && <span className="mr-2">✨</span>}
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex justify-start">
                      <div className={`max-w-[85%] p-3 rounded-2xl rounded-bl-none ${isDarkMode ? 'bg-gray-800' : 'bg-white border shadow-sm'}`}>
                         <div className="flex gap-1">
                           <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                           <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                         </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t dark:border-gray-800 bg-white dark:bg-gray-900 mt-auto">
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && askAiChat()}
                      placeholder="Ask anything about this page..."
                      className="flex-1 bg-transparent outline-none text-sm dark:text-white"
                      disabled={isAiLoading}
                    />
                    <button onClick={askAiChat} disabled={!chatInput.trim() || isAiLoading} className="text-blue-600 disabled:text-gray-400 font-bold ml-2">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reader;
