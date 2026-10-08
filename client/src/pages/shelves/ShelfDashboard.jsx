import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Layers, Sparkles, CheckCircle2, AlertTriangle, 
  ArrowRight, HardDrive, Compass, BookOpen, Filter 
} from 'lucide-react';

const ShelfDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, shelvesRes] = await Promise.all([
        api.get('/v1/shelves/analytics'),
        api.get('/v1/shelves')
      ]);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (shelvesRes.data.success) setShelves(shelvesRes.data.data);
    } catch (error) {
      toast.error("Failed to load shelf intelligence");
    } finally {
      setLoading(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(shelves.map(s => s.category).filter(Boolean)))];

  const filteredShelves = shelves.filter(shelf => {
    if (categoryFilter === 'ALL') return true;
    return shelf.category === categoryFilter;
  });

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600/20 border-t-blue-600 mb-3"></div>
        <p className="text-xs text-slate-400">Loading shelf telemetry heatmap...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Physical Shelf Intelligence
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                Spatial Mapping
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Live capacity monitoring, bay and rack allocation, and book density heatmaps
            </p>
          </div>
        </div>

        <Link 
          to="/shelves/recommendations" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all transform active:scale-95 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Shelf Optimizer AI</span>
        </Link>
      </div>

      {/* Analytics KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Shelves & Bays</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {analytics.totalShelves || shelves.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Configured spatial locations</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Space Utilization</div>
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 flex items-baseline gap-2">
              {analytics.utilizationPercent || 0}%
              <span className="text-xs font-normal text-slate-400">
                ({analytics.totalOccupied || 0} / {analytics.totalCapacity || 0})
              </span>
            </div>
            <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-1">Overall collection storage density</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Balanced Shelves</div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>{analytics.healthyCount || 0}</span>
            </div>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Under 80% maximum capacity</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Overloaded Racks</div>
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>{analytics.overloadedCount || 0}</span>
            </div>
            <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">Requires redistribution</p>
          </div>
        </div>
      )}

      {/* Main Heatmap Section */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm overflow-hidden">
        
        {/* Category Filters Bar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Floor Utilization Heatmap
            </span>
          </div>

          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Heatmap Grid */}
        <div className="p-6">
          {filteredShelves.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-400 max-w-sm mx-auto">
              No shelf slots configured for this criteria. Access Physical Library settings to add racks and bays.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShelves.map(shelf => {
                const capacity = shelf.capacity || 50;
                const occupied = shelf.occupiedSlots || 0;
                const util = Math.round((occupied / capacity) * 100);

                let statusBadge = "Healthy";
                let statusColor = "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40";
                let barColor = "bg-emerald-500";

                if (util >= 90) {
                  statusBadge = "Critical Density";
                  statusColor = "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40";
                  barColor = "bg-rose-500";
                } else if (util >= 75) {
                  statusBadge = "Near Full";
                  statusColor = "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40";
                  barColor = "bg-amber-500";
                }

                return (
                  <div 
                    key={shelf._id} 
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                            {shelf.shelfCode || `SHELF-${shelf._id?.slice(-4)}`}
                          </h3>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                            {shelf.category || 'General Collection'}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                          {statusBadge}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-4">
                        <span>{shelf.floor || 'Floor 1'}</span>
                        <span>•</span>
                        <span>Section {shelf.section || 'A'}</span>
                        <span>•</span>
                        <span>Rack {shelf.rack || '01'}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <span>{occupied} Books Placed</span>
                        <span>{capacity} Slots ({util}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${barColor} rounded-full transition-all duration-500`} 
                          style={{ width: `${Math.min(util, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShelfDashboard;
