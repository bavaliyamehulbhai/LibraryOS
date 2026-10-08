import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useBookAnalytics, useCategoryAnalytics } from "../../hooks/useAnalytics";
import { 
  BookOpen, 
  Award, 
  AlertTriangle, 
  PieChart as PieChartIcon, 
  Download, 
  ArrowLeft, 
  RefreshCw, 
  Flame, 
  Bookmark, 
  TrendingUp, 
  Search,
  Sparkles,
  ExternalLink,
  Layers,
  ArchiveRestore
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const PALETTE = [
  '#4f46e5', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#64748b'  // Slate
];

const BookAnalytics = () => {
  const { data: bookData, isLoading: loadingBooks, refetch: refetchBooks } = useBookAnalytics();
  const { data: catData, isLoading: loadingCats, refetch: refetchCats } = useCategoryAnalytics();

  const [activeTab, setActiveTab] = useState("POPULAR"); // POPULAR, DEAD, VELOCITY
  const [searchTerm, setSearchTerm] = useState("");

  const mostPopular = bookData?.data?.mostPopular || [];
  const deadInventory = bookData?.data?.deadInventory || [];
  const turnoverRatio = bookData?.data?.turnoverRatio || [];
  const categories = catData?.data || [];

  // Top Volume
  const topVolume = mostPopular[0] || null;

  // Filtered lists
  const filteredPopular = useMemo(() => {
    if (!searchTerm) return mostPopular;
    return mostPopular.filter(b => 
      (b.title && b.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.author && b.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.isbn && b.isbn.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [mostPopular, searchTerm]);

  const filteredDead = useMemo(() => {
    if (!searchTerm) return deadInventory;
    return deadInventory.filter(b => 
      (b.title && b.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.author && b.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.isbn && b.isbn.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [deadInventory, searchTerm]);

  // Top Popular Chart Data (Top 5)
  const popularChartData = useMemo(() => {
    return mostPopular.slice(0, 6).map(b => ({
      name: b.title.length > 20 ? b.title.substring(0, 18) + "..." : b.title,
      fullTitle: b.title,
      issues: b.issues || 0
    }));
  }, [mostPopular]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Rank", "Book Title", "Author", "ISBN", "Total Circulation Issues", "Available Copies", "Total Copies"];
    const rows = mostPopular.map((b, idx) => [
      idx + 1,
      `"${b.title?.replace(/"/g, '""') || ''}"`,
      `"${b.author?.replace(/"/g, '""') || ''}"`,
      `"${b.isbn || ''}"`,
      b.issues || 0,
      b.availableCopies || 0,
      b.totalCopies || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Book_Circulation_Popularity_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    refetchBooks();
    refetchCats();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
              <Award className="w-3.5 h-3.5" /> Catalog & Title Intelligence
            </span>
            <span className="text-xs text-slate-400 font-medium">Circulation Velocity Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Book Velocity & Genre Distribution
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Discover premier high-demand reading assets, evaluate genre penetration, and revitalize dormant inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl shadow-xs transition"
            title="Refresh Analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={mostPopular.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Download className="w-4 h-4" /> Export Title Velocity CSV
          </button>
          <Link
            to="/analytics/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>

      {/* Bento Metric KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Circulation Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">#1 Most Borrowed</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 truncate" title={topVolume?.title || "N/A"}>
            {loadingBooks ? "..." : (topVolume?.title || "No data")}
          </div>
          <div className="text-xs text-amber-600 font-bold mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{topVolume ? `${topVolume.issues} total checkouts` : "Pending issues"}</span>
          </div>
        </div>

        {/* Catalog Categories */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Genres / Categories</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-600">
            {loadingCats ? "..." : categories.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Subject disciplines represented
          </div>
        </div>

        {/* High Turnover Titles */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Peak Velocity Titles</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-600">
            {loadingBooks ? "..." : turnoverRatio.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Volumes actively turning over
          </div>
        </div>

        {/* Dormant / Dead Inventory */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dormant Inventory</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <ArchiveRestore className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-700">
            {loadingBooks ? "..." : deadInventory.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Titles with zero lifetime borrows
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Category Distribution Donut & Popular Volumes Velocity Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Category Fleet Proportion</h3>
                <p className="text-xs text-slate-400">Distribution of titles across catalog subject areas</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold">
              {categories.reduce((acc, c) => acc + c.count, 0)} Total Titles
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {loadingCats ? (
              <div className="text-sm text-slate-400">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="text-sm text-slate-400 bg-slate-50 p-6 rounded-xl w-full text-center">
                No active categories detected.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cat-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} Books`, name]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(val) => <span className="text-xs font-semibold text-slate-700">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top 6 Popular Titles Circulation Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Peak Circulation Velocity</h3>
                <p className="text-xs text-slate-400">Total lifetime circulation issues by title</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
              Top Volumes
            </span>
          </div>

          <div className="h-72 w-full">
            {loadingBooks ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">Loading popularity...</div>
            ) : popularChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400 bg-slate-50 rounded-xl">
                No borrow records recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularChartData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} width={100} />
                  <Tooltip
                    formatter={(val) => [`${val} total checkouts`, "Circulation"]}
                    labelFormatter={(label, items) => items?.[0]?.payload?.fullTitle || label}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }}
                  />
                  <Bar dataKey="issues" fill="#4f46e5" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Tabs / Filter Navigation Table for Popular Books vs Dormant Inventory */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab("POPULAR")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "POPULAR" 
                  ? "bg-indigo-600 text-white shadow-xs" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Most Popular Titles ({mostPopular.length})
            </button>
            <button
              onClick={() => setActiveTab("DEAD")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "DEAD" 
                  ? "bg-slate-900 text-white shadow-xs" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ArchiveRestore className="w-3.5 h-3.5" /> Dormant Catalog ({deadInventory.length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, author, ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-hidden w-64 transition"
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          {loadingBooks ? (
            <div className="p-12 text-center text-slate-400">Loading catalog statistics...</div>
          ) : activeTab === "POPULAR" ? (
            filteredPopular.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No popular titles match your query.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5 w-16 text-center">Rank</th>
                    <th className="px-6 py-3.5">Title & Author</th>
                    <th className="px-6 py-3.5 text-center">Lifetime Checkouts</th>
                    <th className="px-6 py-3.5 text-center">Available Stock</th>
                    <th className="px-6 py-3.5 text-center">Circulation Tier</th>
                    <th className="px-6 py-3.5 text-right">Catalog Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPopular.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 text-center">
                        {idx === 0 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-black text-xs inline-flex items-center justify-center">1</span>
                        ) : idx === 1 ? (
                          <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center justify-center">2</span>
                        ) : idx === 2 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-700/10 text-amber-800 font-bold text-xs inline-flex items-center justify-center">3</span>
                        ) : (
                          <span className="text-slate-400 font-semibold text-xs">{idx + 1}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          {item.author && <span>By {item.author}</span>}
                          {item.isbn && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="font-mono text-slate-400">ISBN: {item.isbn}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Flame className="w-3.5 h-3.5 text-indigo-600" />
                          {item.issues} checkouts
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-slate-700">{item.availableCopies ?? item.available ?? 0}</span>
                        <span className="text-xs text-slate-400"> / {item.totalCopies ?? item.total ?? 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.issues >= 10 ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">Blockbuster</span>
                        ) : item.issues >= 4 ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">High Demand</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Standard Steady</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/catalog?search=${encodeURIComponent(item.title || '')}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                        >
                          View Copies <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            filteredDead.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">No Dormant Inventory Found</h4>
                <p className="text-slate-500 text-xs mt-1">Every title in your catalog has achieved at least one checkout.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Dormant Title & Author</th>
                    <th className="px-6 py-3.5 text-center">Available Stock</th>
                    <th className="px-6 py-3.5 text-center">Total Stock</th>
                    <th className="px-6 py-3.5 text-center">Diagnosis</th>
                    <th className="px-6 py-3.5 text-right">Promotional Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDead.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          {item.author && <span>By {item.author}</span>}
                          {item.isbn && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="font-mono text-slate-400">ISBN: {item.isbn}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">
                        {item.available || 0}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-500">
                        {item.total || item.available || 0}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Uncirculated Asset
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/catalog?search=${encodeURIComponent(item.title || '')}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Feature on Portal
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAnalytics;
