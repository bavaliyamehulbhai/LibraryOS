import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Bot, Send, Sparkles, User, RefreshCw, Copy, Check, 
  HelpCircle, BookOpen, Users, DollarSign, Clock, AlertCircle 
} from 'lucide-react';

// Clean & Rich Markdown Formatter for Copilot Messages
const FormattedMessage = ({ content, metadata }) => {
  if (!content) return null;

  // Clean rogue symbols like ++, unclosed asterisks, etc.
  const cleaned = content
    .replace(/\+\+([^*]+)\*\*/g, '**$1**')
    .replace(/\*\*([^*]+)\+\+/g, '**$1**')
    .replace(/\+\+/g, '');

  const paragraphs = cleaned.split('\n');

  const renderLine = (line) => {
    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
    const textToProcess = isBullet ? line.trim().substring(2) : line;

    // Tokenize bold **text**
    const parts = textToProcess.split(/(\*\*[^*]+\*\*)/g);

    const rendered = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-white bg-blue-50/70 dark:bg-blue-900/30 px-1 py-0.5 rounded text-[12px]">
            {inner}
          </strong>
        );
      }
      return part;
    });

    if (isBullet) {
      return (
        <li key={line} className="flex items-start gap-2 my-1 text-slate-700 dark:text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
          <span>{rendered}</span>
        </li>
      );
    }

    return <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{rendered}</span>;
  };

  const dbResult = metadata?.dbResult;

  return (
    <div className="space-y-2.5">
      <div className="space-y-1.5 text-xs">
        {paragraphs.map((p, idx) => {
          if (!p.trim()) return <div key={idx} className="h-1.5" />;
          return (
            <div key={idx}>
              {renderLine(p)}
            </div>
          );
        })}
      </div>

      {/* Visual Metric Cards when structured data is available */}
      {dbResult && (dbResult.active !== undefined || dbResult.count !== undefined || dbResult.availableCopies !== undefined || dbResult.totalUnpaidAmount !== undefined) && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {dbResult.active !== undefined && (
            <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 rounded-xl p-2.5 shadow-sm">
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Active Members</span>
              <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">{dbResult.active}</span>
            </div>
          )}
          {dbResult.total !== undefined && (
            <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/50 rounded-xl p-2.5 shadow-sm">
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Total Registered</span>
              <span className="text-base font-extrabold text-blue-700 dark:text-blue-300">{dbResult.total}</span>
            </div>
          )}
          {dbResult.joinedThisMonth !== undefined && (
            <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/50 rounded-xl p-2.5 shadow-sm">
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Joined This Month</span>
              <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-300">+{dbResult.joinedThisMonth}</span>
            </div>
          )}
          {dbResult.count !== undefined && (
            <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 rounded-xl p-2.5 shadow-sm">
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Overdue Books</span>
              <span className="text-base font-extrabold text-amber-700 dark:text-amber-300">{dbResult.count}</span>
            </div>
          )}
          {dbResult.availableCopies !== undefined && (
            <div className="bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200/70 dark:border-cyan-800/50 rounded-xl p-2.5 shadow-sm">
              <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">Available Copies</span>
              <span className="text-base font-extrabold text-cyan-700 dark:text-cyan-300">{dbResult.availableCopies}</span>
            </div>
          )}
          {dbResult.totalUnpaidAmount !== undefined && (
            <div className="bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/50 rounded-xl p-2.5 shadow-sm">
              <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Unpaid Fines</span>
              <span className="text-base font-extrabold text-rose-700 dark:text-rose-300">₹{dbResult.totalUnpaidAmount}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SUGGESTED_PROMPTS = [
  { label: "Overdue books summary", icon: Clock, prompt: "Show me all books that are currently overdue and list the members holding them." },
  { label: "Active members count", icon: Users, prompt: "What is the total count of active members and how many joined this month?" },
  { label: "Revenue & fines collected", icon: DollarSign, prompt: "Give me a breakdown of fines collected and transaction revenue for this month." },
  { label: "Most borrowed categories", icon: BookOpen, prompt: "Which book categories have the highest circulation and borrow rates?" }
];

const Assistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initial greeting
  useEffect(() => {
    setMessages([
      { 
        role: 'assistant', 
        content: "Hello! I am LibraryOS Copilot v2.0. You can query your catalog, overdue records, member statistics, or ask for operational assistance.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  const handleSend = async (userQuery) => {
    const query = (typeof userQuery === 'string' ? userQuery : input).trim();
    if (!query) return;

    setInput('');
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Optimistic UI update
    setMessages(prev => [...prev, { role: 'user', content: query, timestamp: timeNow }]);
    setLoading(true);

    try {
      const res = await api.post('/v1/ai/chat', { 
        message: query,
        sessionId: sessionId 
      });

      if (res.data.success) {
        if (!sessionId && res.data.data?.sessionId) {
          setSessionId(res.data.data.sessionId);
        }
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: res.data.data?.message?.content || "Query executed successfully.",
          metadata: res.data.data?.message?.metadata,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (error) {
      toast.error('Failed to get a response from Copilot.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I encountered an error reaching the knowledge engine. Please check your network or try again shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleNewChat = () => {
    setMessages([{ 
      role: 'assistant', 
      content: "New session started. How can I assist your library operations today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]); 
    setSessionId(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen flex flex-col">
      {/* Top Header Card */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 mb-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                LibraryOS Copilot
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                v2.0 Online
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Neural Assistant trained on catalog management, circulation rules & member intelligence
            </p>
          </div>
        </div>

        <button 
          onClick={handleNewChat}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Thread</span>
        </button>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 flex flex-col glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-sm">
        
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={idx} 
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5 shadow-md shadow-blue-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`relative group max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-blue-500/20' 
                    : msg.isError
                      ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 rounded-tl-none'
                      : 'bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  <div className="flex items-center justify-between mb-1 text-[10px] opacity-70">
                    <span className="font-semibold">{isUser ? 'You' : 'Copilot'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <FormattedMessage content={msg.content} metadata={msg.metadata} />
                  )}

                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Telemetry Verified</span>
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition"
                        title="Copy Response"
                      >
                        {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.3s]"></span>
                <span className="text-[11px] text-slate-400 ml-2 font-medium">Analyzing records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Bar */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0">
            Suggested:
          </span>
          {SUGGESTED_PROMPTS.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => handleSend(item.prompt)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition whitespace-nowrap flex-shrink-0 disabled:opacity-50"
              >
                <Icon className="w-3 h-3 text-blue-500" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }} 
            className="relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot anything about inventory, members, circulation or policies..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-1.5 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 transition shadow-sm active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2 text-[10px] text-slate-400">
            Powered by LibraryOS Neural Engine • Verify critical data prior to operational execution
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
