import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Setup pdf.js worker - using unpkg for more reliable CDN delivery in Vite apps
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Reader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  
  // PDF State
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  
  // UI State
  const [activeTab, setActiveTab] = useState('notes'); // notes, ai
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Features State
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

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
    setIsAiLoading(true);
    setAiResponse("");
    try {
      // In a real app we'd pass the actual extracted page text. We pass a mock string here.
      const res = await api.post('/v1/reader/ai/summarize', { text: `Simulated text from page ${pageNumber}` });
      if (res.data.success) {
        setAiResponse(res.data.data);
      }
    } catch (error) {
      toast.error("AI request failed");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Loading Reader Engine...</div>;
  if (!resource) return null;

  return (
    <div className={`flex h-screen flex-col ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-900'} transition-colors`}>
      
      {/* Top Toolbar */}
      <div className={`h-16 flex items-center justify-between px-6 border-b ${isDarkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-300 bg-white shadow-sm'}`}>
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 hover:text-blue-500">
            &larr; Exit
          </button>
          <h1 className="font-bold truncate max-w-md" title={resource.title}>{resource.title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="p-2 bg-gray-200 dark:bg-gray-800 rounded">Zoom Out</button>
            <span className="p-2 font-bold">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(2.5, s + 0.25))} className="p-2 bg-gray-200 dark:bg-gray-800 rounded">Zoom In</button>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded bg-gray-200 dark:bg-gray-800"
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* PDF Viewer Area */}
        <div className="flex-1 overflow-auto flex justify-center p-8 relative">
          <div className="shadow-2xl">
             <Document
              file={'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="p-10">Loading PDF...</div>}
              error={<div className="p-10 text-red-500">Error loading PDF. Ensure the URL is valid.</div>}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                renderTextLayer={false} 
                renderAnnotationLayer={false}
                className={isDarkMode ? 'filter invert hue-rotate-180' : ''} // CSS trick for Dark Mode PDF
              />
            </Document>
          </div>
          
          {/* Floating Pagination */}
          <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-full shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button disabled={pageNumber <= 1} onClick={() => changePage(-1)} className="px-3 hover:text-blue-500 font-bold">&lt;</button>
            <span>Page {pageNumber} of {numPages || '--'}</span>
            <button disabled={pageNumber >= numPages} onClick={() => changePage(1)} className="px-3 hover:text-blue-500 font-bold">&gt;</button>
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
            <button 
              className={`flex-1 p-4 font-bold flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'text-blue-500 border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              <span className="text-xl">🤖</span> AI Assistant
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'notes' && (
              <div className="space-y-6">
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
              <div className="space-y-6">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-blue-900/20 border-blue-800 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                  <p className="text-sm">Hi! I'm your AI Reading Assistant. I can summarize pages, explain complex terms, or quiz you on this content.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={askAiSummarize} disabled={isAiLoading} className="py-2 px-3 bg-indigo-600 text-white text-sm font-bold rounded hover:bg-indigo-700 disabled:opacity-50">
                    Summarize Page
                  </button>
                  <button disabled className="py-2 px-3 bg-purple-600 text-white text-sm font-bold rounded opacity-50 cursor-not-allowed">
                    Explain Text
                  </button>
                </div>

                {isAiLoading && (
                  <div className="flex justify-center py-8">
                     <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                )}

                {aiResponse && !isAiLoading && (
                  <div className={`p-4 rounded-lg text-sm leading-relaxed ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <h3 className="font-bold mb-2 flex items-center gap-2"><span className="text-indigo-500">✨</span> AI Insight</h3>
                    {aiResponse}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reader;
