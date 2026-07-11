import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Book, Users, Clock, AlertTriangle, IndianRupee, FileText, CalendarCheck, Activity } from 'lucide-react';

const CirculationDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("7");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          api.get('/v1/circulation-dashboard'),
          api.get(`/v1/circulation-dashboard/charts?days=${timeframe}`)
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (chartsRes.data.success) setChartData(chartsRes.data.data);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [timeframe]);

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  const healthScore = stats ? Math.max(0, 100 - ((stats.overdueBooks || 0) * 2) - ((stats.pendingFines || 0) / 1000)) : 100;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0f1117] dark:to-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">🏛️</span> Circulation Command Center
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">Real-time operational view of LibraryOS.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <select 
                className="appearance-none bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 py-2.5 pl-10 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm cursor-pointer"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 3 Months</option>
              </select>
              <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
            <Link to="/circulation/feed" className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold border border-indigo-200 hover:bg-indigo-100 transition flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
              Live Feed
            </Link>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {[
            { title: "Total Books", value: stats?.totalBooks || 0, icon: Book, color: "blue" },
            { title: "Members", value: stats?.totalMembers || 0, icon: Users, color: "indigo" },
            { title: "Active Issues", value: stats?.activeIssues || 0, icon: Clock, color: "sky" },
            { title: "Overdue", value: stats?.overdueBooks || 0, icon: AlertTriangle, color: "rose" },
            { title: "Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: "emerald" },
            { title: "Pending Fines", value: `₹${(stats?.pendingFines || 0).toLocaleString()}`, icon: FileText, color: "amber" },
            { title: "Reservations", value: stats?.pendingReservations || 0, icon: CalendarCheck, color: "purple" },
          ].map((kpi, index) => {
            const Icon = kpi.icon;
            const colorMap = {
              blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
              indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
              sky: { bg: 'bg-sky-50 dark:bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400' },
              rose: { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
              emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
              amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
              purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
            };
            const colors = colorMap[kpi.color];

            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.text}`}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{kpi.value}</h2>
                  <p className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 mt-1">{kpi.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart */}
          {/* Main Chart */}
          <div className="lg:col-span-2 relative overflow-hidden bg-white/70 dark:bg-gray-800/50 backdrop-blur-2xl rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/20 border border-white/60 dark:border-gray-700/50 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 relative z-10 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-indigo-500" /> Circulation Trends (Last {timeframe} Days)
            </h3>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }}
                  />
                  <Line type="monotone" dataKey="issues" stroke="#3b82f6" strokeWidth={4} dot={{r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 7, strokeWidth: 0, fill: '#2563eb', shadow: '0px 0px 10px #3b82f6'}} name="Issues" />
                  <Line type="monotone" dataKey="returns" stroke="#10b981" strokeWidth={4} dot={{r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 7, strokeWidth: 0, fill: '#059669', shadow: '0px 0px 10px #10b981'}} name="Returns" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Health Score */}
          <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-2xl rounded-[1.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/20 border border-white/60 dark:border-gray-700/50 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className={`absolute top-0 right-0 p-4 text-7xl opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 ${healthScore > 80 ? 'text-green-500' : healthScore > 50 ? 'text-yellow-500' : 'text-red-500'}`}>❤️</div>
            <div className={`absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${healthScore > 80 ? 'bg-green-500' : healthScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            
            <h3 className="font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-xs mb-4 w-full text-left relative z-10">Library Health Score</h3>
            
            <div className="relative w-48 h-48 flex items-center justify-center my-4 z-10">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-gray-100 dark:text-gray-700/50" />
                <circle 
                  cx="96" 
                  cy="96" 
                  r="80" 
                  stroke="currentColor" 
                  strokeWidth="14" 
                  fill="transparent" 
                  strokeLinecap="round"
                  strokeDasharray="502" 
                  strokeDashoffset={502 - (502 * healthScore) / 100}
                  className={`transition-all duration-1500 ease-out ${healthScore > 80 ? 'text-emerald-500' : healthScore > 50 ? 'text-amber-500' : 'text-rose-500'}`} 
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-6xl font-black ${healthScore > 80 ? 'text-emerald-600 dark:text-emerald-400' : healthScore > 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>{Math.round(healthScore)}</span>
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-wider">/ 100</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-4 font-medium relative z-10 bg-gray-50/50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700/50">
              {healthScore > 80 ? "Operations are running smoothly 🚀" : "Attention needed on overdues or fines ⚠️"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CirculationDashboard;
