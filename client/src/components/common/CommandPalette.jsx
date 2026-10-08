import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, BookOpen, Users, ArrowRightLeft, Sparkles, 
  BarChart3, Settings, Shield, PlusCircle, Moon, Sun, 
  FileText, Bookmark, Compass, X, Command
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { APP_VERSION } from '../../constants/version';

const COMMANDS = [
  // Quick Actions
  {
    id: 'act-new-book',
    title: 'Add New Book',
    description: 'Catalog a new physical or digital book with ISBN autofill',
    category: 'Quick Actions',
    icon: PlusCircle,
    path: '/books/new',
    badge: 'Action'
  },
  {
    id: 'act-new-member',
    title: 'Register Member',
    description: 'Onboard a new student or community member',
    category: 'Quick Actions',
    icon: Users,
    path: '/students/new',
    badge: 'Action'
  },
  {
    id: 'act-issue-book',
    title: 'Circulation & Issue Desk',
    description: 'Issue, renew or return books for members',
    category: 'Quick Actions',
    icon: ArrowRightLeft,
    path: '/transactions',
    badge: 'Action'
  },

  // Core Modules
  {
    id: 'nav-dashboard',
    title: 'Executive Dashboard',
    description: 'Live KPIs, circulation trends and library statistics',
    category: 'Navigation',
    icon: BarChart3,
    path: '/dashboard',
    badge: 'v2.0'
  },
  {
    id: 'nav-books',
    title: 'Books Catalog',
    description: 'Browse, manage and inspect all book inventory',
    category: 'Navigation',
    icon: BookOpen,
    path: '/books'
  },
  {
    id: 'nav-members',
    title: 'Members Directory',
    description: 'View active library members, memberships, and cards',
    category: 'Navigation',
    icon: Users,
    path: '/members'
  },
  {
    id: 'nav-digital',
    title: 'Digital Library & E-Books',
    description: 'Read and manage PDF e-books and online collections',
    category: 'Navigation',
    icon: Bookmark,
    path: '/digital-library'
  },
  {
    id: 'nav-ai',
    title: 'AI Study & Research Companion',
    description: 'Intelligent summaries, semantic discovery and study tools',
    category: 'Intelligence',
    icon: Sparkles,
    path: '/ai-study',
    badge: 'AI Powered'
  },
  {
    id: 'nav-analytics',
    title: 'Global Analytics & Growth',
    description: 'Deep telemetry, revenue charts and branch performance',
    category: 'Intelligence',
    icon: BarChart3,
    path: '/global-analytics'
  },
  {
    id: 'nav-reports',
    title: 'Reports & Export Center',
    description: 'Download CSV and Excel reports for audit and operations',
    category: 'Navigation',
    icon: FileText,
    path: '/reports'
  },
  {
    id: 'nav-audit',
    title: 'Audit Logs & SecOps',
    description: 'System access logs, security checks and multi-tenant telemetry',
    category: 'System',
    icon: Shield,
    path: '/audit'
  },
  {
    id: 'nav-settings',
    title: 'Library Settings & Policies',
    description: 'Configure loan periods, fine rules, and tenant preferences',
    category: 'System',
    icon: Settings,
    path: '/settings'
  }
];

const CommandPalette = ({ isOpen, onClose, onOpenWhatsNew }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef(null);

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredCommands = COMMANDS.filter((cmd) => {
    const q = search.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Keyboard navigation inside modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeItem = filteredCommands[selectedIndex];
        if (activeItem) {
          executeCommand(activeItem);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  const executeCommand = (cmd) => {
    onClose();
    if (cmd.path) {
      navigate(cmd.path);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <Search className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or jump to feature (e.g., Book, Member, AI, Audit)..."
            className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 text-base focus:outline-none"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2"
            >
              <X size={16} />
            </button>
          )}
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-100/50 dark:divide-slate-800/50">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Compass className="w-10 h-10 mx-auto mb-2 opacity-40 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
              <p className="text-sm font-medium">No commands found matching "{search}"</p>
              <p className="text-xs mt-1 text-slate-500">Try searching for Books, Issue, Members, or AI</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'}`}>
                      <Icon size={18} />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          {cmd.title}
                        </span>
                        {cmd.badge && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                            isSelected 
                              ? 'bg-white/20 text-white' 
                              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                          }`}>
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                        {cmd.description}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-mono shrink-0 ml-3 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {cmd.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                toggleTheme();
                onClose();
              }}
              className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              <span>{theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}</span>
            </button>
            <button
              onClick={() => {
                onClose();
                if (onOpenWhatsNew) onOpenWhatsNew();
              }}
              className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>What's New in v{APP_VERSION}</span>
            </button>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px]">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">↑↓</kbd>
            <span>Navigate</span>
            <kbd className="ml-1 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">↵</kbd>
            <span>Select</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
