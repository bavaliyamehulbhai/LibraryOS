import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useInventoryAnalytics } from "../../hooks/useAnalytics";
import { 
  Package, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  ArrowLeft, 
  Search, 
  Filter, 
  PieChart as PieIcon, 
  BarChart3, 
  Layers, 
  RefreshCw,
  BookOpen,
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";

const CONDITION_COLORS = {
  NEW: "#10b981",       // Emerald
  GOOD: "#3b82f6",      // Blue
  FAIR: "#f59e0b",      // Amber
  POOR: "#f97316",      // Orange
  DAMAGED: "#ef4444",   // Red
  LOST: "#64748b"       // Slate
};

const STATUS_COLORS = {
  AVAILABLE: "#10b981",
  ISSUED: "#6366f1",
  RESERVED: "#ec4899",
  DAMAGED: "#ef4444",
  LOST: "#64748b",
  MISSING: "#e11d48"
};

const InventoryAnalytics = () => {
  const { data: invData, isLoading, refetch } = useInventoryAnalytics();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("ALL"); // ALL, CRITICAL (0), LOW (1-2), MODERATE (3)

  const summary = invData?.data?.summary || {
    totalCopies: 0,
    availableCopies: 0,
    issuedCopies: 0,
    reservedCopies: 0,
    damagedCopies: 0,
    lostCopies: 0,
    totalTitles: 0,
    utilizationRate: 0,
    healthRate: 100
  };

  const lowStock = invData?.data?.lowStock || [];
  const copyConditions = invData?.data?.copyStats || [];
  const copyStatuses = invData?.data?.copyStatusStats || [];

  // Condition Pie data
  const conditionChartData = useMemo(() => {
    return copyConditions.map(item => ({
      name: item._id || "NEW",
      value: item.count,
      color: CONDITION_COLORS[item._id] || "#94a3b8"
    }));
  }, [copyConditions]);

  // Status Bar data
  const statusChartData = useMemo(() => {
    return copyStatuses.map(item => ({
      status: item._id || "AVAILABLE",
      count: item.count,
      color: STATUS_COLORS[item._id] || "#6366f1"
    }));
  }, [copyStatuses]);

  // Filtered low stock table
  const filteredLowStock = useMemo(() => {
    return lowStock.filter(item => {
      const matchesSearch = 
        (item.book && item.book.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.isbn && item.isbn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.author && item.author.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchesSearch) return false;

      if (filterSeverity === "CRITICAL") return item.available === 0;
      if (filterSeverity === "LOW") return item.available >= 1 && item.available <= 2;
      if (filterSeverity === "MODERATE") return item.available === 3;
      return true;
    });
  }, [lowStock, searchTerm, filterSeverity]);

  // Export CSV
  const handleExportCSV = () => {
    if (lowStock.length === 0) return;
    const headers = ["Book Title", "Author", "ISBN", "Total Copies", "Available Copies", "Issued Copies", "Status"];
    const rows = lowStock.map(b => [
      `"${b.book?.replace(/"/g, '""') || ''}"`,
      `"${b.author?.replace(/"/g, '""') || ''}"`,
      `"${b.isbn || ''}"`,
      b.total || 0,
      b.available || 0,
      b.issued || 0,
      b.available === 0 ? "OUT OF STOCK" : b.available <= 2 ? "CRITICAL LOW" : "LOW"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventory_LowStock_Replenishment_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Package className="w-3.5 h-3.5" /> Fleet Asset Telemetry
            </span>
            <span className="text-xs text-slate-400 font-medium">Real-time Stock Sentinel</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Inventory Health & Fleet Capacity
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time physical asset condition auditing, catalog depletion telemetry, and procurement warnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl shadow-xs transition"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={lowStock.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Download className="w-4 h-4" /> Export Replenishment CSV
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Physical Asset Fleet */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Fleet Copies</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {isLoading ? "..." : summary.totalCopies.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Across {summary.totalTitles} unique titles</span>
          </div>
        </div>

        {/* Ready Available */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ready On Shelves</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {isLoading ? "..." : summary.availableCopies.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <span className="text-emerald-600 font-bold">
              {summary.totalCopies > 0 ? Math.round((summary.availableCopies / summary.totalCopies) * 100) : 0}%
            </span>
            <span>of inventory ready</span>
          </div>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Utilization</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-600">
            {isLoading ? "..." : `${summary.utilizationRate}%`}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {summary.issuedCopies} volumes currently on loan
          </div>
        </div>

        {/* Asset Preservation Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Asset Health Score</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-teal-600">
            {isLoading ? "..." : `${summary.healthRate}%`}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {summary.damagedCopies + summary.lostCopies} damaged/lost copies
          </div>
        </div>

        {/* Low Stock Depletion Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-red-200/90 shadow-xs relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">Low Stock Warnings</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-red-600">
            {isLoading ? "..." : lowStock.length}
          </div>
          <div className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1">
            <span>&le; 3 units available on shelf</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Physical Conditions & Status Fleet Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Physical Copy Condition Pie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Physical Condition Breakdown</h3>
                <p className="text-xs text-slate-400">Material wear assessment across all catalog barcodes</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-slate-600">
              {copyConditions.reduce((acc, c) => acc + c.count, 0)} Total Scans
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {isLoading ? (
              <div className="text-sm text-slate-400">Loading conditions...</div>
            ) : conditionChartData.length === 0 ? (
              <div className="text-sm text-slate-400 bg-slate-50 p-6 rounded-xl w-full text-center">
                No physical barcode conditions audited yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {conditionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} copies`, name]}
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

        {/* Copy Status Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Asset Status Telemetry</h3>
                <p className="text-xs text-slate-400">Circulation, reservation, and quarantine balance</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
              Live Allocation
            </span>
          </div>

          <div className="h-64 w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">Loading asset statuses...</div>
            ) : statusChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400 bg-slate-50 rounded-xl">
                No asset status counts found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(val) => [`${val} copies`, "Fleet Count"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Replenishment Sentinel Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-lg">Replenishment Radar & Depleted Inventory</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Titles where available shelf stock has fallen below the safety replenishment threshold (&le; 3 units).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Filter Pills */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                onClick={() => setFilterSeverity("ALL")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  filterSeverity === "ALL" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({lowStock.length})
              </button>
              <button
                onClick={() => setFilterSeverity("CRITICAL")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  filterSeverity === "CRITICAL" ? "bg-red-600 text-white" : "text-slate-600 hover:text-red-600"
                }`}
              >
                Zero Available ({lowStock.filter(i => i.available === 0).length})
              </button>
              <button
                onClick={() => setFilterSeverity("LOW")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  filterSeverity === "LOW" ? "bg-amber-500 text-white" : "text-slate-600 hover:text-amber-600"
                }`}
              >
                1-2 Copies ({lowStock.filter(i => i.available >= 1 && i.available <= 2).length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search title, ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden w-48 transition"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">Loading replenishment telemetry...</div>
          ) : filteredLowStock.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">All Inventory Thresholds Satisfied</h4>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                No titles are currently depleted below safe circulation reserves. All collections are well-stocked.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Title & Catalog Details</th>
                  <th className="px-6 py-3.5 text-center">Total Stock</th>
                  <th className="px-6 py-3.5 text-center">Active Loans</th>
                  <th className="px-6 py-3.5 text-center">Available on Shelf</th>
                  <th className="px-6 py-3.5 text-center">Urgency Level</th>
                  <th className="px-6 py-3.5 text-right">Procurement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLowStock.map((item, idx) => {
                  const isOut = item.available === 0;
                  const isCritical = item.available > 0 && item.available <= 2;
                  const pctAvailable = item.total > 0 ? Math.round((item.available / item.total) * 100) : 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{item.book}</div>
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
                        {item.total || 0}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-indigo-600">
                        {item.issued || 0}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-bold">
                          <span className={`text-base ${isOut ? "text-red-600" : isCritical ? "text-amber-600" : "text-slate-800"}`}>
                            {item.available}
                          </span>
                          <span className="text-xs text-slate-400 font-normal">/ {item.total}</span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="w-20 mx-auto bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div 
                            className={`h-full rounded-full ${isOut ? "bg-red-500" : isCritical ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.max(pctAvailable, 5)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                            Depleted (0 left)
                          </span>
                        ) : isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            Critical Alert ({item.available} left)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            Replenish Soon
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/catalog?search=${encodeURIComponent(item.book || '')}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Re-order Order
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalytics;
