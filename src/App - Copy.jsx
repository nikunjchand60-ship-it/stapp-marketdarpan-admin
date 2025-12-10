import React, { useState, useMemo, useRef } from 'react';
import { 
  BrowserRouter as Router, Routes, Route, Link, useLocation 
} from 'react-router-dom';
import { 
  LayoutDashboard, Users, ClipboardList, Settings, LogOut, 
  Search, Download, Filter, Plus, Trash2, Edit, Save, 
  BarChart3, AlertCircle, FileJson, CheckCircle, X, 
  FileSpreadsheet, PieChart as PieIcon, Upload, Briefcase, RefreshCw, FileText, ChevronDown, ChevronRight, 
  Radar as RadarIcon, Circle, Store, Shield, MapPin, AlertTriangle, Image as ImageIcon, PlayCircle, PauseCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar, FunnelChart, Funnel, LabelList, Treemap, ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- 1. DATA STRUCTURES & MOCKS ---
// STRICTLY MATCHING YOUR EXCEL FILE COLUMNS
const EXCEL_HEADERS = [
  "City", "Zone", "S No.", "Outlet Name", "Location", "Survey Date", "Brand", "SKU", "Category", 
  "BU", "Unit", "Batch No.", "MFG Date", "Exp. Date", "Unit Name", "MFG Type", 
  "Sample Checked", "Defect (Cr.+Ma.)", "Defect Type", "Freshness", "Defect generation from"
];

const RAW_AUDIT_DATA = [
  { 
    id: 101, City: "Ahmedabad", Zone: "West", "S No.": 1, "Outlet Name": "D Mart", Location: "Bandu Nagar", "Survey Date": "22-10-2024", 
    Brand: "Honey", SKU: 1300, Category: "Health Supplement", BU: "Health Care", Unit: "Gm", 
    "Batch No.": "BM5592", "MFG Date": "20-07-2024", "Exp. Date": "19-01-2026", "Unit Name": "Baddi Manakpur", 
    "MFG Type": "DIL Unit", "Sample Checked": 26, "Defect (Cr.+Ma.)": 0, "Defect Type": "", 
    Freshness: 94, "Defect generation from": "" 
  },
  { 
    id: 102, City: "Ahmedabad", Zone: "West", "S No.": 1, "Outlet Name": "D Mart", Location: "Bandu Nagar", "Survey Date": "22-10-2024", 
    Brand: "Honey", SKU: 1300, Category: "Health Supplement", BU: "Health Care", Unit: "Gm", 
    "Batch No.": "BM5595", "MFG Date": "23-07-2024", "Exp. Date": "22-01-2026", "Unit Name": "Baddi Manakpur", 
    "MFG Type": "DIL Unit", "Sample Checked": 18, "Defect (Cr.+Ma.)": 1, "Defect Type": "Torn Label", 
    Freshness: 91, "Defect generation from": "Manufacturing" 
  }
];

const INITIAL_USERS = [
  { id: 1, name: 'Nikunj', email: 'nc14842@gmail.com', role: 'Admin', status: 'Active', zone: 'North', assignedSurvey: 'None' },
  { id: 2, name: 'Amit Verma', email: 'amit@dabur.com', role: 'Editor', status: 'Active', zone: 'West', assignedSurvey: 'Q4 Audit' },
];

const INITIAL_SURVEYS = [
  { id: 'S1', title: 'Q4 Market Sweep', status: 'Active', questions: [
      { id: 1, text: "Is the branding visible?", type: "Yes/No" },
      { id: 2, text: "Rate the shelf hygiene (1-5)", type: "Rating" }
  ]}
];

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#ec4899', '#6366f1', '#14b8a6'];

// --- COMPONENTS ---

const Login = ({ onLogin }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const handleSSOLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => { onLogin({ name: "Azure User", email: "user@azure.com", role: "Admin" }); setIsLoggingIn(false); }, 1500);
  };
  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-emerald-100 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"><Store size={40} className="text-emerald-600" /></div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Market Darpan</h1>
        <p className="text-gray-500 mb-8">Admin Command Center</p>
        <button onClick={handleSSOLogin} disabled={isLoggingIn} className="w-full bg-[#2F2F2F] text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors flex justify-center items-center gap-3 shadow-lg">
           {isLoggingIn ? "Connecting..." : "Sign in with Microsoft SSO"}
        </button>
        <button onClick={() => onLogin({ name: "Dev Admin", email: "dev@local", role: "Admin" })} className="mt-6 text-sm text-gray-500 hover:text-emerald-600 underline">Skip Login (Dev Mode)</button>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${color}`}><Icon size={24} className="text-white" /></div>
  </div>
);

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/' },
    { icon: ClipboardList, label: 'Audit Records', path: '/audits' },
    { icon: FileJson, label: 'Manage Surveys', path: '/surveys' },
    { icon: Shield, label: 'Role Management', path: '/users' },
  ];
  return (
    <div className="w-64 h-screen bg-emerald-900 text-white flex flex-col fixed left-0 top-0 z-40 shadow-xl">
      <div className="p-6 border-b border-emerald-800 flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg"><Store size={20} /></div>
        <div><h1 className="text-lg font-bold tracking-tight">Market Darpan</h1><p className="text-emerald-300 text-xs uppercase font-bold tracking-widest">Admin Panel</p></div>
      </div>
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path ? 'bg-emerald-700 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <item.icon size={20} /><span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-emerald-800">
         <button onClick={onLogout} className="flex items-center gap-3 text-emerald-200 hover:text-white px-4 py-2 w-full transition-colors"><LogOut size={18} /> Sign Out</button>
      </div>
    </div>
  );
};

// 5. DASHBOARD VIEW WITH FILTERS
const Dashboard = ({ auditData, setAuditData, customCharts, setCustomCharts }) => {
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [newWidget, setNewWidget] = useState({ title: '', type: 'bar', groupBy: 'Brand', metric: 'defects', color: '#10B981' });
  
  // DASHBOARD FILTERS
  const [filters, setFilters] = useState({ zone: 'All', city: 'All', brand: 'All' });

  // Compute Unique Options for Dropdowns
  const uniqueZones = ['All', ...new Set(auditData.map(d => d.Zone).filter(Boolean))];
  const uniqueCities = ['All', ...new Set(auditData.map(d => d.City).filter(Boolean))];
  const uniqueBrands = ['All', ...new Set(auditData.map(d => d.Brand).filter(Boolean))];

  // Apply Filters
  const filteredAuditData = useMemo(() => {
    return auditData.filter(item => {
        return (filters.zone === 'All' || item.Zone === filters.zone) &&
               (filters.city === 'All' || item.City === filters.city) &&
               (filters.brand === 'All' || item.Brand === filters.brand);
    });
  }, [auditData, filters]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const allLines = text.split(/\r\n|\n/);
      const newEntries = [];
      const headers = EXCEL_HEADERS; 
      for (let i = 1; i < allLines.length; i++) {
        const rowText = allLines[i].trim();
        if (!rowText) continue;
        const row = rowText.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (row.every(cell => !cell || cell.trim() === '')) continue;
        const entry = { id: Date.now() + i };
        let hasData = false;
        headers.forEach((header, index) => {
           let val = row[index] ? row[index].replace(/^"|"$/g, '').trim() : '';
           if (["Sample Checked", "Defect (Cr.+Ma.)", "Freshness", "SKU"].includes(header)) val = Number(val) || 0;
           if (val !== '') hasData = true;
           entry[header] = val;
        });
        if (hasData) newEntries.push(entry);
      }
      if (newEntries.length > 0) { setAuditData([...auditData, ...newEntries]); alert(`Successfully imported ${newEntries.length} records!`); } 
      else { alert("No valid data found."); }
    };
    reader.readAsText(file);
  };

  const aggregateData = (data, groupBy, metric) => {
    const result = {};
    data.forEach(row => {
      const key = row[groupBy] || 'Unknown';
      if (!result[key]) result[key] = 0;
      if (metric === 'count') result[key] += 1;
      else if (metric === 'defects') result[key] += (Number(row["Defect (Cr.+Ma.)"]) || 0);
      else if (metric === 'samples') result[key] += (Number(row["Sample Checked"]) || 0);
    });
    return Object.keys(result).map(key => ({ name: key, value: result[key] }));
  };

  const kpiStats = useMemo(() => ({
    totalAudits: filteredAuditData.length,
    totalDefects: filteredAuditData.reduce((acc, curr) => acc + (Number(curr["Defect (Cr.+Ma.)"]) || 0), 0),
    totalSamples: filteredAuditData.reduce((acc, curr) => acc + (Number(curr["Sample Checked"]) || 0), 0),
    activeCities: new Set(filteredAuditData.map(a => a.City)).size
  }), [filteredAuditData]);

  return (
    <div className="p-8 ml-64 bg-gray-50 min-h-screen animate-in fade-in duration-500">
      {/* Header & Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Executive Dashboard</h2>
        <div className="flex gap-3">
          <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50 shadow-sm font-medium transition-all">
            <Upload size={18} className="text-emerald-600" /> Import CSV
          </button>
          <button onClick={() => setIsWidgetModalOpen(true)} className="bg-gray-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-900 shadow-lg font-medium transition-all">
            <PieIcon size={18} /> Widget Builder
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase"><Filter size={16} /> Filters:</div>
          
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-400">Zone</label>
            <select className="border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none focus:border-emerald-500"
                value={filters.zone} onChange={e => setFilters({...filters, zone: e.target.value})}>
                {uniqueZones.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-400">City</label>
            <select className="border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none focus:border-emerald-500"
                value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})}>
                {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-400">Brand</label>
            <select className="border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none focus:border-emerald-500"
                value={filters.brand} onChange={e => setFilters({...filters, brand: e.target.value})}>
                {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          
          <button onClick={() => setFilters({zone:'All', city:'All', brand:'All'})} className="ml-auto text-xs text-red-500 hover:text-red-700 font-bold underline">Reset Filters</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Audits" value={kpiStats.totalAudits} icon={ClipboardList} color="bg-blue-500" />
        <StatCard title="Defects Found" value={kpiStats.totalDefects} icon={AlertTriangle} color="bg-red-500" />
        <StatCard title="Samples Checked" value={kpiStats.totalSamples.toLocaleString()} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard title="Active Cities" value={kpiStats.activeCities} icon={MapPin} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
          <h3 className="font-bold text-gray-700 mb-6">Live: Defects by Brand</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={aggregateData(filteredAuditData, 'Brand', 'defects')}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{fontSize: 10}} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {customCharts.map(widget => {
           const chartData = aggregateData(filteredAuditData, widget.groupBy, widget.metric);
           return (
            <div key={widget.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group h-96">
                <div className="flex justify-between mb-4">
                  <div><h3 className="font-bold text-gray-700">{widget.title}</h3><p className="text-xs text-gray-400 capitalize">{widget.type} | {widget.metric} by {widget.groupBy}</p></div>
                  <button onClick={() => setCustomCharts(customCharts.filter(c => c.id !== widget.id))} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                </div>
                <ResponsiveContainer width="100%" height="85%">
                    {widget.type === 'bar' && <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill={widget.color} radius={[4,4,0,0]} /></BarChart>}
                    {widget.type === 'line' && <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" stroke={widget.color} strokeWidth={3} dot={{r:4}} /></LineChart>}
                    {widget.type === 'area' && <AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="value" stroke={widget.color} fill={widget.color} /></AreaChart>}
                    {widget.type === 'pie' && <PieChart><Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value">{chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>}
                </ResponsiveContainer>
            </div>
           );
        })}
      </div>

      <Modal isOpen={isWidgetModalOpen} onClose={() => setIsWidgetModalOpen(false)} title="Chart Builder">
         <div className="space-y-4">
            <input type="text" className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Chart Title" value={newWidget.title} onChange={e => setNewWidget({...newWidget, title: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Chart Type</label>
                    <select className="w-full border p-3 rounded-xl mt-1 bg-white outline-none" value={newWidget.type} onChange={e => setNewWidget({...newWidget, type: e.target.value})}>
                        <option value="bar">Bar Chart</option><option value="line">Line Chart</option><option value="area">Area Chart</option><option value="pie">Pie Chart</option>
                    </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Group By (X-Axis)</label>
                  <select className="w-full border p-3 rounded-xl mt-1 bg-white outline-none" value={newWidget.groupBy} onChange={e => setNewWidget({...newWidget, groupBy: e.target.value})}>
                      {EXCEL_HEADERS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Metric (Y-Axis)</label>
                  <select className="w-full border p-3 rounded-xl mt-1 bg-white outline-none" value={newWidget.metric} onChange={e => setNewWidget({...newWidget, metric: e.target.value})}>
                      <option value="count">Count of Rows</option><option value="defects">Sum of Defects</option><option value="samples">Sum of Samples Checked</option>
                  </select>
                </div>
            </div>
            <div>
               <label className="text-xs font-bold text-gray-400 uppercase">Color Theme</label>
               <div className="flex gap-2 mt-2">
                  {COLORS.map(c => <button key={c} onClick={() => setNewWidget({...newWidget, color: c})} className={`w-8 h-8 rounded-full border-2 ${newWidget.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`} style={{backgroundColor: c}} />)}
               </div>
            </div>
            <button onClick={() => { setCustomCharts([...customCharts, { ...newWidget, id: Date.now() }]); setIsWidgetModalOpen(false); }} className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all">Generate Widget</button>
         </div>
      </Modal>
    </div>
  );
};

// 6. AUDIT LOGS VIEW WITH FILTERS AND FULL COLUMNS
const AuditLogs = ({ auditData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudit, setSelectedAudit] = useState(null);
  
  // AUDIT FILTERS
  const [filters, setFilters] = useState({ zone: 'All', brand: 'All', defectType: 'All' });
  const uniqueZones = ['All', ...new Set(auditData.map(d => d.Zone).filter(Boolean))];
  const uniqueBrands = ['All', ...new Set(auditData.map(d => d.Brand).filter(Boolean))];
  const uniqueDefects = ['All', ...new Set(auditData.map(d => d["Defect Type"]).filter(Boolean))];

  const filteredData = auditData.filter(row => {
     const matchesSearch = Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
     const matchesFilters = (filters.zone === 'All' || row.Zone === filters.zone) &&
                            (filters.brand === 'All' || row.Brand === filters.brand) &&
                            (filters.defectType === 'All' || row["Defect Type"] === filters.defectType);
     return matchesSearch && matchesFilters;
  });

  return (
    <div className="p-8 ml-64 bg-gray-50 min-h-screen animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Audit Records</h2>
        <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input type="text" placeholder="Search anything..." className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl w-72 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm" onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase"><Filter size={16} /> Filters:</div>
          <select className="border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none" value={filters.zone} onChange={e => setFilters({...filters, zone: e.target.value})}>{uniqueZones.map(z => <option key={z} value={z}>Zone: {z}</option>)}</select>
          <select className="border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none" value={filters.brand} onChange={e => setFilters({...filters, brand: e.target.value})}>{uniqueBrands.map(b => <option key={b} value={b}>Brand: {b}</option>)}</select>
          <select className="border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none" value={filters.defectType} onChange={e => setFilters({...filters, defectType: e.target.value})}>{uniqueDefects.map(d => <option key={d} value={d}>Defect: {d}</option>)}</select>
          <button onClick={() => setFilters({zone:'All', brand:'All', defectType:'All'})} className="ml-auto text-xs text-red-500 hover:text-red-700 font-bold underline">Clear All</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
             <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                   <tr>
                       <th className="p-4 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">View</th>
                       {EXCEL_HEADERS.map(h => <th key={h} className="p-4 border-b border-gray-100">{h}</th>)}
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {filteredData.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                         <td className="p-4 sticky left-0 bg-white z-10 border-r border-gray-100">
                             <button onClick={() => setSelectedAudit(row)} className="text-emerald-600 hover:bg-emerald-100 p-2 rounded-lg"><ChevronRight size={18}/></button>
                         </td>
                         {EXCEL_HEADERS.map(h => <td key={h} className="p-4 text-gray-700">{row[h]}</td>)}
                      </tr>
                   ))}
                </tbody>
             </table>
         </div>
      </div>

      {selectedAudit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
            <div className="bg-white w-full max-w-2xl h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Audit Details</h2>
                    <button onClick={() => setSelectedAudit(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
                </div>
                <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-4">Core Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs text-gray-400 block">Outlet</label><p className="font-bold text-gray-800">{selectedAudit["Outlet Name"]}</p></div>
                            <div><label className="text-xs text-gray-400 block">City</label><p className="font-bold text-gray-800">{selectedAudit.City}</p></div>
                            <div><label className="text-xs text-gray-400 block">Date</label><p className="font-bold text-gray-800">{selectedAudit["Survey Date"]}</p></div>
                            <div><label className="text-xs text-gray-400 block">Zone</label><p className="font-bold text-gray-800">{selectedAudit.Zone}</p></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="border border-gray-200 rounded-xl p-4">
                             <h4 className="font-bold text-gray-800 mb-2">Product Info</h4>
                             <p className="text-sm">Brand: <span className="font-medium">{selectedAudit.Brand}</span></p>
                             <p className="text-sm">SKU: <span className="font-medium">{selectedAudit.SKU}</span></p>
                             <p className="text-sm">Batch: <span className="font-medium">{selectedAudit["Batch No."]}</span></p>
                        </div>
                        <div className={`border rounded-xl p-4 ${Number(selectedAudit["Defect (Cr.+Ma.)"]) > 0 ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                             <h4 className={`font-bold mb-2 flex items-center gap-2 ${Number(selectedAudit["Defect (Cr.+Ma.)"]) > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                                {Number(selectedAudit["Defect (Cr.+Ma.)"]) > 0 ? <AlertTriangle size={18}/> : <CheckCircle size={18}/>}
                                Quality Status
                             </h4>
                             <p className="text-sm">Defects Found: <span className="font-bold">{selectedAudit["Defect (Cr.+Ma.)"]}</span></p>
                             <p className="text-sm">Defect Type: <span className="font-medium">{selectedAudit["Defect Type"]}</span></p>
                             <p className="text-sm">Source: <span className="font-medium">{selectedAudit["Defect generation from"]}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// 7. USER MANAGEMENT & 8. SURVEY CONFIG (Kept same as advanced version)
const UserManagement = ({ users, setUsers, surveys }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Admin', zone: 'North', assignedSurvey: 'None' });
  const openAdd = () => { setEditingUser(null); setFormData({ name: '', email: '', role: 'Admin', zone: 'North', assignedSurvey: 'None' }); setIsModalOpen(true); };
  const openEdit = (user) => { setEditingUser(user); setFormData(user); setIsModalOpen(true); };
  const handleSave = () => {
    if (editingUser) setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    else setUsers([...users, { id: Date.now(), ...formData, status: 'Active' }]);
    setIsModalOpen(false);
  };
  return (
    <div className="p-8 ml-64 bg-gray-50 min-h-screen animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800">Role Management</h2><button onClick={openAdd} className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-200"><Plus size={18} /> Invite User</button></div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 font-bold text-gray-500 uppercase text-xs"><tr><th className="p-6">Name</th><th className="p-6">Role</th><th className="p-6">Assigned Survey</th><th className="p-6 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{users.map(user => (<tr key={user.id} className="hover:bg-gray-50 transition-colors"><td className="p-6"><div className="font-bold text-gray-800">{user.name}</div><div className="text-xs text-gray-500 font-normal">{user.email}</div></td><td className="p-6"><span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span></td><td className="p-6 text-emerald-600 font-medium text-sm">{user.assignedSurvey}</td><td className="p-6 text-right"><button onClick={() => openEdit(user)} className="text-gray-400 hover:text-blue-600 mr-3"><Edit size={18}/></button><button onClick={() => setUsers(users.filter(u => u.id !== user.id))} className="text-gray-400 hover:text-red-600"><Trash2 size={18}/></button></td></tr>))}</tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Edit User" : "Invite User"}>
         <div className="space-y-4">
            <input className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
                <select className="border p-3 rounded-xl bg-white outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}><option>Admin</option><option>Editor</option><option>Viewer</option></select>
                <select className="border p-3 rounded-xl bg-white outline-none" value={formData.assignedSurvey} onChange={e => setFormData({...formData, assignedSurvey: e.target.value})}><option value="None">No Task Assigned</option>{surveys.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}</select>
            </div>
            <button onClick={handleSave} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg transition-all">Save Details</button>
         </div>
      </Modal>
    </div>
  );
};

const SurveyConfig = ({ surveys, setSurveys }) => {
  const [selectedSurveyId, setSelectedSurveyId] = useState(surveys.length > 0 ? surveys[0].id : null);
  const activeSurvey = surveys.find(s => s.id === selectedSurveyId) || { id: 'temp', title: 'No Survey', questions: [] };
  const handleAddNewSurvey = () => { const newId = Date.now(); const newSurvey = { id: newId, title: "New Untitled Survey", status: 'Draft', questions: [] }; setSurveys([...surveys, newSurvey]); setSelectedSurveyId(newId); };
  const handleDeleteSurvey = () => { if (surveys.length <= 1) return alert("Cannot delete the last survey!"); const remaining = surveys.filter(s => s.id !== selectedSurveyId); setSurveys(remaining); setSelectedSurveyId(remaining[0].id); };
  const updateSurveyTitle = (newTitle) => { setSurveys(surveys.map(s => s.id === selectedSurveyId ? { ...s, title: newTitle } : s)); };
  const toggleStatus = () => { const newStatus = activeSurvey.status === 'Active' ? 'Draft' : 'Active'; setSurveys(surveys.map(s => s.id === selectedSurveyId ? { ...s, status: newStatus } : s)); };
  const addQuestion = () => { const newQ = { id: Date.now(), text: "New Question", type: "Text" }; setSurveys(surveys.map(s => s.id === selectedSurveyId ? { ...s, questions: [...s.questions, newQ] } : s)); };
  const updateQuestion = (qId, field, value) => { setSurveys(surveys.map(s => s.id === selectedSurveyId ? { ...s, questions: s.questions.map(q => q.id === qId ? { ...q, [field]: value } : q) } : s)); };
  const deleteQuestion = (qId) => { setSurveys(surveys.map(s => s.id === selectedSurveyId ? { ...s, questions: s.questions.filter(q => q.id !== qId) } : s)); };

  return (
    <div className="p-8 ml-64 bg-gray-50 min-h-screen animate-in fade-in duration-500">
       <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4"><h2 className="text-2xl font-bold text-gray-800">Survey Manager</h2><div className="flex gap-2"><select className="border border-gray-200 rounded-lg p-2 font-medium text-gray-700 outline-none focus:border-emerald-500 bg-white" value={selectedSurveyId} onChange={e => setSelectedSurveyId(Number(e.target.value) || e.target.value)}>{surveys.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select><button onClick={handleAddNewSurvey} className="bg-emerald-100 text-emerald-700 p-2 rounded-lg hover:bg-emerald-200" title="Create New Survey"><Plus size={20}/></button></div></div>
        <button onClick={handleDeleteSurvey} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-100 font-medium"><Trash2 size={18} /> Delete Survey</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
         <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-6"><div className="flex-1 mr-8"><label className="text-xs font-bold text-gray-400 uppercase">Survey Title</label><input type="text" className="w-full text-2xl font-bold text-gray-800 border-none outline-none focus:ring-0 p-0 placeholder-gray-300" value={activeSurvey.title} onChange={(e) => updateSurveyTitle(e.target.value)}/></div><div className="flex items-center gap-4"><button onClick={toggleStatus} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeSurvey.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{activeSurvey.status === 'Active' ? <PlayCircle size={16}/> : <PauseCircle size={16}/>}{activeSurvey.status} Mode</button></div></div>
         <div className="space-y-4">{activeSurvey.questions.map((q, index) => (<div key={q.id} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-200 group transition-all hover:border-emerald-300"><span className="font-bold text-gray-400 w-8">Q{index + 1}</span><input type="text" className="flex-1 bg-transparent border-b border-gray-300 pb-1 focus:border-emerald-500 outline-none font-medium text-gray-700" value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)} /><select className="border border-gray-200 rounded-lg p-2 bg-white text-sm outline-none" value={q.type} onChange={e => updateQuestion(q.id, 'type', e.target.value)}><option>Text</option><option>Yes/No</option><option>Rating</option><option>Photo</option></select><button onClick={() => deleteQuestion(q.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button></div>))}</div>
         <button onClick={addQuestion} className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all flex justify-center items-center gap-2"><Plus size={20} /> Add Question</button>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [auditData, setAuditData] = useState(RAW_AUDIT_DATA);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [surveys, setSurveys] = useState(INITIAL_SURVEYS);
  const [customCharts, setCustomCharts] = useState([]);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <Router>
      <div className="font-sans text-gray-900 bg-gray-50">
        <Sidebar onLogout={() => setUser(null)} />
        <header className="fixed top-0 right-0 left-64 bg-white p-4 border-b border-gray-200 flex justify-end items-center z-30 h-16">
            <div className="flex items-center gap-3 mr-4"><div className="text-right"><p className="text-sm font-bold text-gray-900">{user.name}</p><p className="text-xs text-gray-500">{user.role}</p></div><div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">{user.name.charAt(0)}</div></div>
        </header>
        <div className="pt-16">
            <Routes>
            <Route path="/" element={<Dashboard auditData={auditData} setAuditData={setAuditData} customCharts={customCharts} setCustomCharts={setCustomCharts} />} />
            <Route path="/users" element={<UserManagement users={users} setUsers={setUsers} surveys={surveys} />} />
            <Route path="/audits" element={<AuditLogs auditData={auditData} />} />
            <Route path="/surveys" element={<SurveyConfig surveys={surveys} setSurveys={setSurveys} />} />
            </Routes>
        </div>
      </div>
    </Router>
  );
}