import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Assistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    setMessages([
      { role: 'assistant', content: "Hello! I am LibraryOS Copilot. You can ask me things like 'Show overdue books', 'Total active members', or 'Revenue this month'." }
    ]);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input.trim();
    setInput('');
    
    // Optimistic UI update
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setLoading(true);

    try {
      const res = await api.post('/v1/ai/chat', { 
        message: userQuery,
        sessionId: sessionId 
      });

      if (res.data.success) {
        if (!sessionId) {
          setSessionId(res.data.data.sessionId);
        }
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: res.data.data.message.content 
        }]);
      }
    } catch (error) {
      toast.error('Failed to get a response from Copilot.');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-4xl flex-1 flex flex-col bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-white/50 dark:border-gray-700/50 overflow-hidden relative z-10">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-md z-10 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="flex items-center relative z-10">
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center text-2xl mr-4 backdrop-blur-sm">
              🤖
            </div>
            <div>
              <h1 className="text-2xl font-bold">LibraryOS Copilot</h1>
              <p className="text-blue-100 text-sm opacity-90">AI Librarian Assistant</p>
            </div>
          </div>
          <button 
            onClick={() => { setMessages([{ role: 'assistant', content: 'New session started. How can I help?' }]); setSessionId(null); }}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md relative z-10 hover:-translate-y-0.5"
          >
            New Chat
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-transparent">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] rounded-3xl px-6 py-4 shadow-md backdrop-blur-md ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm' 
                  : 'bg-white/90 dark:bg-gray-800/90 border border-white/50 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="text-xs font-bold text-indigo-500 mb-1 flex items-center">
                    <span className="mr-1">✨</span> Copilot
                  </div>
                )}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-white/90 dark:bg-gray-800/90 border border-white/50 dark:border-gray-700 rounded-3xl rounded-bl-sm px-6 py-5 shadow-md flex space-x-2 items-center backdrop-blur-md">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 backdrop-blur-md">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. 'How many overdue books?')"
              className="w-full pl-6 pr-16 py-4 bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all shadow-inner"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
            Copilot can make mistakes. Verify critical actions in the dashboard.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
