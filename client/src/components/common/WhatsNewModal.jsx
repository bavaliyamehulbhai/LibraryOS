import React from 'react';
import { 
  Sparkles, CheckCircle2, X, Rocket, Zap, 
  ShieldCheck, Command, TrendingUp, Layers, ArrowRight 
} from 'lucide-react';
import { APP_VERSION, APP_RELEASE_NAME, APP_RELEASE_DATE, RELEASE_NOTES_V2 } from '../../constants/version';

const ICON_MAP = {
  Sparkles,
  Command,
  TrendingUp,
  Layers,
  ShieldCheck
};

const WhatsNewModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Banner */}
        <div className="relative p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl"></div>
          <div className="absolute right-12 bottom-0 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
          
          <div className="flex items-center justify-between relative z-10 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-indigo-400/20 border border-indigo-300/30 text-indigo-200">
                {RELEASE_NOTES_V2.badge}
              </span>
              <span className="text-xs text-indigo-200">
                Version {APP_VERSION} • {APP_RELEASE_DATE}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight relative z-10">
            {RELEASE_NOTES_V2.headline}
          </h2>
          <p className="text-sm text-indigo-200 mt-1 relative z-10">
            {APP_RELEASE_NAME} brings a modern enterprise UI, instantaneous navigation, and rich analytical workflows.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Key Architecture & Experience Upgrades
          </h3>

          <div className="grid grid-cols-1 gap-3.5">
            {RELEASE_NOTES_V2.features.map((feat, idx) => {
              const IconComponent = ICON_MAP[feat.icon] || Sparkles;
              return (
                <div 
                  key={idx}
                  className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition"
                >
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {feat.title}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {feat.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">Ctrl + K</kbd> anywhere to launch Command Palette
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
          >
            <span>Explore LibraryOS 2.0</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsNewModal;
